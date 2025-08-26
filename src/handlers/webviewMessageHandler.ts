import * as vscode from "vscode";
import axios from "axios";
import logger from "../utils/logger";
import { FromWebview, ToWebview } from "../constants/messageTypes";
import { SERVER_DOMAIN } from "../config";
import { IntegrationService } from "../services/IntegrationService";
import { IntegrationPlatform } from "../types";
import * as fs from "fs";
import * as path from "path";

export async function handleWebviewMessage(
    message: any,
    panel: vscode.WebviewPanel,
    context: vscode.ExtensionContext
) {
    logger.info("✅ Received from Webview:", message);

    switch (message.type) {
        // case FromWebview.SendJiraUrl:
        // const jiraUrl = message.payload.jiraUrl;
        // const token = await context.secrets.get("jira_access_token");

        // // context.secrets.delete("jira_access_token");
        // // context.secrets.delete("jira_refresh_token");
        // if (!jiraUrl) {
        //     vscode.window.showErrorMessage("❌ Jira URL is missing.");
        //     return;
        // }

        // if (!token) {
        //     vscode.window.showWarningMessage("🔐 Please authenticate with Jira first.");
        //     initiateJiraAuth();
        //     return;
        // }

        // try {
        //     vscode.window.showInformationMessage(
        //         "🧾 Fetching Jira issue and extracting insights..."
        //     );

        //     const result = await fetchJiraAndExtract(jiraUrl, token);

        //     panel.webview.postMessage({
        //         type: ToWebview.JiraDetailsFetched,
        //         payload: result,
        //     });
        // } catch (err: any) {
        //     console.error("❌ Failed to fetch Jira ticket or extract requirements:", err);
        //     vscode.window.showErrorMessage("❌ Failed to fetch Jira ticket or analyze it.");
        // }

        // break;

        case FromWebview.SendJiraUrl:
            const ticketUrl = message.payload.jiraUrl;
            const token = await context.secrets.get("jira_access_token");

            if (!ticketUrl) {
                vscode.window.showErrorMessage("❌ Ticket URL is missing.");
                return;
            }

            const integrationService = new IntegrationService();
            
            // Check if URL is supported
            if (!integrationService.isUrlSupported(ticketUrl)) {
                vscode.window.showErrorMessage("❌ Unsupported ticket URL format. Supported platforms: Jira, Trello, Linear, GitHub Issues.");
                return;
            }

            const adapter = integrationService.getAdapterForUrl(ticketUrl);
            if (!adapter) {
                vscode.window.showErrorMessage("❌ No adapter found for this URL.");
                return;
            }

            // Check authentication for the specific platform
            const isAuthenticated = await integrationService.isAuthenticated(adapter.platform);
            if (!isAuthenticated) {
                vscode.window.showWarningMessage(`🔐 Please authenticate with ${adapter.name} first.`);
                
                // For Jira, fallback to server-based auth if available
                if (adapter.platform === IntegrationPlatform.JIRA && !token) {
                    try {
                        const authUrl = (await axios.get(SERVER_DOMAIN + "/api/auth/jira")).data.authUrl;
                        vscode.env.openExternal(vscode.Uri.parse(authUrl));
                    } catch {
                        await integrationService.initiateAuth(adapter.platform);
                    }
                } else {
                    await integrationService.initiateAuth(adapter.platform);
                }
                return;
            }

            try {
                vscode.window.showInformationMessage(
                    `🧾 Fetching ${adapter.name} ticket and extracting insights...`
                );

                const result = await integrationService.fetchTicketAndExtract(ticketUrl, token);

                console.log("Extracted Content:", result.extracted);

                const generatedCode = await axios.post(SERVER_DOMAIN + "/api/jira/generate-code", {
                    jiraDocs: result.extracted,
                });

                vscode.window.showInformationMessage("✅ Ticket insights ready.");
                const setupData = generatedCode.data;
                // const setupData = {
                //     setup: {
                //         frontend: {
                //             commands: [
                //                 "npm create vite@latest client -- --template react-ts",
                //                 "cd client",
                //                 "npm install",
                //                 "npm install -D tailwindcss postcss autoprefixer",
                //                 "npx tailwindcss init -p",
                //                 "npm install react-router-dom axios",
                //                 "npm install -D eslint prettier eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks @typescript-eslint/parser @typescript-eslint/eslint-plugin",
                //                 "npm install -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event @testing-library/react-hooks @types/jest",
                //                 "npm run dev",
                //             ],
                //         },
                //         backend: {
                //             commands: [
                //                 "mkdir server && cd server",
                //                 "npm init -y",
                //                 "npm install express axios dotenv cors",
                //                 "npm install -D typescript ts-node-dev @types/express @types/node jest supertest @types/jest eslint prettier eslint-config-prettier",
                //                 "npx tsc --init",
                //                 "npm run dev",
                //             ],
                //         },
                //     },
                //     structureExplanation: {
                //         frontend: {
                //             "client/src/pages": "All main React pages, e.g., ComparePage.tsx",
                //             "client/src/components":
                //                 "Reusable components: WeatherTable, CitySearch, CityItem",
                //             "client/src/services": "Axios-based API service to backend",
                //             "client/src/utils": "Helpers: data transformation, error formatting",
                //             "client/src/styles": "Tailwind config and global CSS",
                //             "client/src/routes": "React Router configuration, route definitions",
                //         },
                //         backend: {
                //             "server/routes": "Express API routes, e.g., weatherRoutes.ts",
                //             "server/controllers": "Controller logic for each route",
                //             "server/services":
                //                 "API logic to fetch/process data from OpenWeatherMap",
                //             "server/config": "Config utilities, e.g. dotenv setup, CORS config",
                //             "server/middleware": "Middlewares: error handler, request logger",
                //             "server/tests": "Unit and integration tests with Supertest/Jest",
                //             "server/server.ts": "Entrypoint for Express app",
                //         },
                //     },
                //     files: {
                //         fileMap: {
                //             "client/package.json":
                //                 '{\n  "name": "client",\n  "version": "1.0.0",\n  "private": true,\n  "scripts": {\n    "dev": "vite",\n    "build": "vite build",\n    "preview": "vite preview",\n    "test": "jest --coverage",\n    "lint": "eslint src --ext .ts,.tsx"\n  },\n  "dependencies": {\n    "axios": "^1.6.0",\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0",\n    "react-router-dom": "^6.14.2"\n  },\n  "devDependencies": {\n    "@testing-library/jest-dom": "^6.0.0",\n    "@testing-library/react": "^14.0.0",\n    "@testing-library/user-event": "^14.4.3",\n    "@types/jest": "^29.5.3",\n    "@types/react": "^18.2.23",\n    "@types/react-dom": "^18.2.7",\n    "autoprefixer": "^10.4.14",\n    "eslint": "8.57.0",\n    "eslint-config-prettier": "9.1.0",\n    "eslint-plugin-react": "7.33.1",\n    "eslint-plugin-react-hooks": "4.6.0",\n    "jest": "29.7.0",\n    "postcss": "8.4.31",\n    "prettier": "3.3.2",\n    "tailwindcss": "3.4.1",\n    "typescript": "5.2.2",\n    "vite": "5.2.5"\n  }\n}',
                //             "client/vite.config.ts":
                //                 "import { defineConfig } from 'vite';\nimport react from '@vitejs/plugin-react';\n\nexport default defineConfig({\n  plugins: [react()],\n  server: {\n    port: Number(process.env.FRONTEND_PORT) || 5173,\n    proxy: {\n      '/api': 'http://localhost:3001',\n    },\n  },\n});\n",
                //             "client/tailwind.config.js":
                //                 "module.exports = {\n  content: [\n    './index.html',\n    './src/**/*.{js,ts,jsx,tsx}',\n  ],\n  theme: {\n    extend: {},\n  },\n  plugins: [],\n};\n",
                //             "client/postcss.config.js":
                //                 "module.exports = {\n  plugins: {\n    tailwindcss: {},\n    autoprefixer: {},\n  },\n};\n",
                //             "client/.env.example":
                //                 "VITE_BACKEND_URL=http://localhost:3001\nVITE_FRONTEND_PORT=5173\n",
                //             "client/.env":
                //                 "VITE_BACKEND_URL=http://localhost:3001\nVITE_FRONTEND_PORT=5173\n",
                //             "client/src/main.tsx":
                //                 "import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport './styles/index.css';\nimport App from './App';\nimport { BrowserRouter } from 'react-router-dom';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <BrowserRouter>\n      <App />\n    </BrowserRouter>\n  </React.StrictMode>\n);\n",
                //             "client/src/App.tsx":
                //                 'import { Routes, Route, Navigate } from \'react-router-dom\';\nimport ComparePage from \'./pages/ComparePage\';\n\nfunction App() {\n  return (\n    <Routes>\n      <Route path="/compare" element={<ComparePage />} />\n      <Route path="*" element={<Navigate to="/compare" />} />\n    </Routes>\n  );\n}\nexport default App;\n',
                //             "client/src/styles/index.css":
                //                 "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n\nhtml, body, #root {\n  height: 100%;\n}\n",
                //             "client/src/pages/ComparePage.tsx":
                //                 'import React, { useState, useEffect, useCallback } from \'react\';\nimport CitySearch from \'../components/CitySearch\';\nimport WeatherTable from \'../components/WeatherTable\';\nimport { getWeatherComparison } from \'../services/weatherService\';\nimport { WeatherData } from \'../utils/types\';\n\nconst MIN_CITIES = 3;\n\nconst ComparePage: React.FC = () => {\n  const [cities, setCities] = useState<string[]>([]);\n  const [weatherList, setWeatherList] = useState<WeatherData[]>([]);\n  const [loading, setLoading] = useState(false);\n  const [unit, setUnit] = useState<\'metric\' | \'imperial\'>(\'metric\');\n  const [error, setError] = useState<string | null>(null);\n\n  // Fetch weather data whenever cities or unit changes\n  useEffect(() => {\n    if (cities.length < MIN_CITIES) {\n      setWeatherList([]);\n      return;\n    }\n    setLoading(true);\n    setError(null);\n    getWeatherComparison(cities, unit)\n      .then(setWeatherList)\n      .catch((err: any) => {\n        if (err.response && err.response.data) {\n          setError(err.response.data.error || \'Error fetching weather data\');\n        } else {\n          setError(\'Network or server error.\');\n        }\n        setWeatherList([]);\n      })\n      .finally(() => setLoading(false));\n  }, [cities, unit]);\n\n  const addCity = useCallback((city: string) => {\n    if (!city || cities.includes(city)) return;\n    setCities([...cities, city]);\n  }, [cities]);\n\n  const removeCity = useCallback((city: string) => {\n    setCities(cities.filter(c => c.toLowerCase() !== city.toLowerCase()));\n  }, [cities]);\n\n  const handleUnitChange = (event: React.ChangeEvent<HTMLSelectElement>) => {\n    setUnit(event.target.value as \'metric\' | \'imperial\');\n  };\n\n  return (\n    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-6 px-2">\n      <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-md">\n        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">Multi-City Weather Comparison</h1>\n        <p className="text-gray-700 mb-6">Compare weather conditions for three or more cities using the search below.</p>\n        <div className="mb-5 flex flex-wrap gap-2 items-center justify-between">\n          <CitySearch onAddCity={addCity} disabled={cities.length >= 10} />\n          <div>\n            <label htmlFor="unit" className="mr-2 text-sm font-medium text-gray-700">Unit:</label>\n            <select id="unit" value={unit} onChange={handleUnitChange} className="border rounded-md py-1 px-2">\n              <option value="metric">Celsius (℃)</option>\n              <option value="imperial">Fahrenheit (℉)</option>\n            </select>\n          </div>\n        </div>\n        {cities.length > 0 && (\n          <div className="mb-2 text-sm text-gray-600">\n            Selected cities: {cities.map((city, i) => (\n              <span key={city} className="inline-flex items-center mr-2 mb-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">\n                {city}\n                <button className="ml-1 text-xs font-bold hover:text-red-500" aria-label={`Remove ${city}`} onClick={() => removeCity(city)}>&times;</button>\n              </span>\n            ))}\n          </div>\n        )}\n        {error && (\n          <div className="text-red-600 bg-red-50 border border-red-200 rounded-md px-4 py-3 my-4">{error}</div>\n        )}\n        {loading ? (\n          <div className="text-center text-gray-600 py-12">Loading weather data...</div>\n        ) : cities.length < MIN_CITIES ? (\n          <div className="text-gray-600 mt-6">Add at least <span className="font-bold">{MIN_CITIES}</span> cities to compare their weather.</div>\n        ) : (\n          <WeatherTable data={weatherList} unit={unit} onRemoveCity={removeCity} />\n        )}\n      </div>\n    </div>\n  );\n};\nexport default ComparePage;\n',
                //             "client/src/components/CitySearch.tsx":
                //                 "import React, { useState } from 'react';\n\ninterface Props {\n  onAddCity: (city: string) => void;\n  disabled?: boolean;\n}\n\nconst popularCities = [\n  'London',\n  'New York',\n  'Paris',\n  'Tokyo',\n  'Sydney',\n  'Toronto',\n  'Berlin',\n  'Singapore',\n  'Dubai',\n  'Los Angeles',\n  'Cape Town',\n  'Moscow',\n];\n\nconst CitySearch: React.FC<Props> = ({ onAddCity, disabled }) => {\n  const [input, setInput] = useState('');\n  const [suggestions, setSuggestions] = useState<string[]>([]);\n  \n  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {\n    setInput(e.target.value);\n    if (e.target.value.length > 0) {\n      setSuggestions(popularCities.filter(city =>\n        city.toLowerCase().includes(e.target.value.toLowerCase())\n      ));\n    } else {\n      setSuggestions([]);\n    }\n  };\n\n  const handleAdd = (city?: string) => {\n    const value = city || input.trim();\n    if (value) {\n      onAddCity(value);\n      setInput('');\n      setSuggestions([]);\n    }\n  };\n\n  const handleKeyDown = (e: React.KeyboardEvent) => {\n    if (e.key === 'Enter' && input.trim()) {\n      handleAdd();\n    }\n  };\n\n  return (\n    <div className=\"relative w-64\">\n      <input\n        type=\"text\"\n        className=\"w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500\"\n        placeholder=\"Add city (e.g. London)\"\n        value={input}\n        onChange={handleInput}\n        onKeyDown={handleKeyDown}\n        disabled={disabled}\n        aria-label=\"City name\"\n      />\n      {suggestions.length > 0 && (\n        <ul className=\"absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10\">\n          {suggestions.map(city => (\n            <li\n              key={city}\n              className=\"px-3 py-2 hover:bg-blue-50 cursor-pointer\"\n              onClick={() => handleAdd(city)}\n            >\n              {city}\n         </li>\n          ))}\n        </ul>\n      )}\n      <button\n        onClick={() => handleAdd()}\n        disabled={!input.trim() || disabled}\n        className=\"absolute right-2 top-1/2 -translate-y-1/2 text-blue-600 font-bold disabled:text-gray-300\"\n        aria-label=\"Add city\"\n      >\n        +\n      </button>\n    </div>\n  );\n};\nexport default CitySearch;\n",
                //             "client/src/components/CityItem.tsx":
                //                 "import React from 'react';\nimport { WeatherData } from '../utils/types';\n\ninterface Props {\n  weather: WeatherData;\n  unit: 'metric' | 'imperial';\n  onRemove?: () => void;\n}\n\nconst CityItem: React.FC<Props> = ({ weather, unit, onRemove }) => {\n  return (\n    <tr className=\"hover:bg-blue-50 transition-colors group relative\">\n      <td className=\"font-semibold px-3 py-2 text-gray-900\">\n        <span className=\"mr-2 align-middle\">\n          <img\n            src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}\n            alt={weather.condition}\n            className=\"w-8 h-8 inline-block align-middle\"\n          />\n        </span>\n        {weather.city}\n      </td>\n      <td className=\"px-3 py-2\">{weather.temp}°{unit === 'metric' ? 'C' : 'F'}</td>\n      <td className=\"px-3 py-2\">{weather.humidity}%</td>\n      <td className=\"px-3 py-2\">{weather.windSpeed} {unit === 'metric' ? 'm/s' : 'mph'}</td>\n      <td className=\"px-3 py-2 capitalize\">{weather.condition}</td>\n      <td className=\"px-3 py-2 text-center\">\n        {onRemove && (\n          <button\n            className=\"text-red-500 hover:text-red-700 font-bold text-lg\"\n            onClick={onRemove}\n            aria-label={`Remove ${weather.city}`}\n            title={`Remove ${weather.city}`}\n          >\n            ×\n          </button>\n        )}\n      </td>\n    </tr>\n  );\n};\nexport default CityItem;\n",
                //             "client/src/components/WeatherTable.tsx":
                //                 'import React from \'react\';\nimport { WeatherData } from \'../utils/types\';\nimport CityItem from \'./CityItem\';\n\ninterface Props {\n  data: WeatherData[];\n  unit: \'metric\' | \'imperial\';\n  onRemoveCity: (city: string) => void;\n}\n\nconst WeatherTable: React.FC<Props> = ({ data, unit, onRemoveCity }) => {\n  return (\n    <div className="overflow-x-auto mt-4">\n      <table className="min-w-full border divide-y divide-gray-200 text-left">\n        <thead className="bg-blue-100">\n          <tr>\n            <th className="px-3 py-2 font-semibold">City</th>\n            <th className="px-3 py-2 font-semibold">Temperature</th>\n            <th className="px-3 py-2 font-semibold">Humidity</th>\n            <th className="px-3 py-2 font-semibold">Wind</th>\n            <th className="px-3 py-2 font-semibold">Conditions</th>\n            <th className="px-3 py-2 font-semibold text-center" aria-label="Remove"/>\n          </tr>\n        </thead>\n        <tbody>\n          {data.length === 0 ? (\n            <tr><td colSpan={6} className="text-center text-gray-500 px-3 py-7">No data available.</td></tr>\n          ) : (\n            data.map(weather => (\n              <CityItem\n                key={weather.city}\n                weather={weather}\n                unit={unit}\n                onRemove={() => onRemoveCity(weather.city)}\n              />\n            ))\n          )}\n        </tbody>\n      </table>\n    </div>\n  );\n};\nexport default WeatherTable;\n',
                //             "client/src/services/weatherService.ts":
                //                 "import axios from 'axios';\nimport { WeatherData } from '../utils/types';\n\nconst BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';\n\nexport async function getWeatherComparison(cities: string[], unit: 'metric' | 'imperial' = 'metric'): Promise<WeatherData[]> {\n  const params = new URLSearchParams();\n  cities.forEach(city => params.append('cities', city));\n  params.append('unit', unit);\n\n  const response = await axios.get(`${BASE_URL}/api/weather/compare?${params.toString()}`);\n  return response.data;\n}\n",
                //             "client/src/utils/types.ts":
                //                 "export interface WeatherData {\n  city: string;\n  temp: number;\n  humidity: number;\n  windSpeed: number;\n  condition: string;\n  icon: string;\n}\n",
                //             "client/src/utils/formatters.ts":
                //                 "export function capitalize(str: string) {\n  if (!str) return '';\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}\n",
                //             "client/src/__tests__/WeatherTable.test.tsx":
                //                 "import { render, screen } from '@testing-library/react';\nimport WeatherTable from '../components/WeatherTable';\nimport { WeatherData } from '../utils/types';\n\ndescribe('WeatherTable', () => {\n  const data: WeatherData[] = [\n    { city: 'London', temp: 14, humidity: 70, windSpeed: 3, condition: 'cloudy', icon: '04d' },\n    { city: 'Paris', temp: 16, humidity: 67, windSpeed: 2, condition: 'clear', icon: '01d' },\n  ];\n\n  it('renders rows for each city', () => {\n    render(<WeatherTable data={data} unit=\"metric\" onRemoveCity={() => {}} />);\n    expect(screen.getByText('London')).toBeInTheDocument();\n    expect(screen.getByText('Paris')).toBeInTheDocument();\n  });\n\n  it('shows No data available if empty', () => {\n    render(<WeatherTable data={[]} unit=\"imperial\" onRemoveCity={() => {}} />);\n    expect(screen.getByText(/no data available/i)).toBeInTheDocument();\n  });\n});\n",
                //             "client/src/__tests__/CitySearch.test.tsx":
                //                 "import { render, screen, fireEvent } from '@testing-library/react';\nimport CitySearch from '../components/CitySearch';\n\ndescribe('CitySearch', () => {\n  it('adds city with button click', () => {\n    const handleAdd = jest.fn();\n    render(<CitySearch onAddCity={handleAdd} />);\n    fireEvent.change(screen.getByPlaceholderText(/add city/i), { target: { value: 'Berlin' } });\n    fireEvent.click(screen.getByRole('button', { name: /add city/i }));\n    expect(handleAdd).toHaveBeenCalledWith('Berlin');\n  });\n\n  it('suggests popular cities', () => {\n    render(<CitySearch onAddCity={() => {}} />);\n    fireEvent.change(screen.getByPlaceholderText(/add city/i), { target: { value: 'lo' } });\n    expect(screen.getByText('London')).toBeInTheDocument();\n    expect(screen.getByText('Los Angeles')).toBeInTheDocument();\n  });\n});\n",
                //             "server/package.json":
                //                 '{\n  "name": "server",\n  "version": "1.0.0",\n  "main": "server.js",\n  "scripts": {\n    "dev": "ts-node-dev server.ts",\n    "start": "node dist/server.js",\n    "test": "jest --coverage",\n    "build": "tsc"\n  },\n  "dependencies": {\n    "axios": "^1.6.0",\n    "cors": "^2.8.5",\n    "dotenv": "^16.3.1",\n    "express": "^4.19.2"\n  },\n  "devDependencies": {\n    "@types/express": "^4.17.21",\n    "@types/jest": "^29.5.3",\n    "@types/node": "^20.9.0",\n    "jest": "29.7.0",\n    "supertest": "6.3.3",\n    "ts-node-dev": "2.0.0",\n    "typescript": "5.2.2",\n    "eslint": "8.57.0",\n    "prettier": "3.3.2",\n    "eslint-config-prettier": "9.1.0"\n  }\n}\n',
                //             "server/tsconfig.json":
                //                 '{\n  "compilerOptions": {\n    "target": "ES2022",\n    "module": "commonjs",\n    "esModuleInterop": true,\n    "outDir": "dist",\n    "rootDir": ".",\n    "strict": true,\n    "skipLibCheck": true,\n    "forceConsistentCasingInFileNames": true\n  },\n  "include": ["**/*.ts"],\n  "exclude": ["node_modules", "dist"]\n}\n',
                //             "server/.env.example": "OPENWEATHERMAP_API_KEY=\nBACKEND_PORT=3001\n",
                //             "server/.env":
                //                 "OPENWEATHERMAP_API_KEY=your-real-openweathermap-api-key\nBACKEND_PORT=3001\n",
                //             "server/server.ts":
                //                 "import express from 'express';\nimport cors from 'cors';\nimport dotenv from 'dotenv';\nimport weatherRoutes from './routes/weatherRoutes';\nimport { errorHandler } from './middleware/errorHandler';\n\ndotenv.config();\n\nconst app = express();\n\n// CORS for localhost:5173 (frontend default)\napp.use(cors({ origin: [/localhost:5173/, /127.0.0.1:5173/] }));\napp.use(express.json());\n\napp.use('/api/weather', weatherRoutes);\n\napp.use(errorHandler);\n\nconst port = process.env.BACKEND_PORT || 3001;\napp.listen(port, () => {\n  // eslint-disable-next-line no-console\n  console.log(`Server listening on port ${port}`);\n});\n",
                //             "server/routes/weatherRoutes.ts":
                //                 "import express from 'express';\nimport { compareWeather } from '../controllers/weatherController';\n\nconst router = express.Router();\n\nrouter.get('/compare', compareWeather);\n\nexport default router;\n",
                //             "server/controllers/weatherController.ts":
                //                 "import { Request, Response, NextFunction } from 'express';\nimport { fetchWeatherForCities } from '../services/weatherService';\n\nexport async function compareWeather(req: Request, res: Response, next: NextFunction) {\n  const { cities, unit } = req.query;\n  let cityList: string[] = [];\n\n  if (typeof cities === 'string') {\n    cityList = [cities];\n  } else if (Array.isArray(cities)) {\n    cityList = cities;\n  } else {\n    return res.status(400).json({ error: 'Missing required cities parameter' });\n  }\n  if (cityList.length < 3) {\n    return res.status(400).json({ error: 'At least three cities are required for comparison.' });\n  }\n  const weatherUnit = (typeof unit === 'string' && (unit === 'imperial' || unit === 'metric')) ? unit : 'metric';\n  try {\n    const data = await fetchWeatherForCities(cityList, weatherUnit);\n    res.json(data);\n  } catch (err) {\n    next(err);\n  }\n}\n",
                //             "server/services/weatherService.ts":
                //                 "import axios from 'axios';\n\nconst cache = new Map<string, any>();\nconst TTL = 60 * 1000; // 1 minute cache to prevent rate limiting\n\ninterface WeatherData {\n  city: string;\n  temp: number;\n  humidity: number;\n  windSpeed: number;\n  condition: string;\n  icon: string;\n}\n\nasync function fetchWeather(city: string, unit: 'metric' | 'imperial'): Promise<WeatherData> {\n  const apiKey = process.env.OPENWEATHERMAP_API_KEY;\n  if (!apiKey) {\n    throw new Error('OpenWeatherMap API key not set');\n  }\n  const cacheKey = `${city.toLowerCase()}|${unit}`;\n  const cached = cache.get(cacheKey);\n  if (cached && (Date.now() - cached.created) < TTL) {\n    return cached.data;\n  }\n  try {\n    const url = `https://api.openweathermap.org/data/2.5/weather`;\n    const resp = await axios.get(url, {\n      params: {\n        q: city,\n        appid: apiKey,\n        units: unit,\n      },\n    });\n    const data = resp.data;\n    const weather: WeatherData = {\n      city: data.name,\n      temp: Math.round(data.main.temp),\n      humidity: data.main.humidity,\n      windSpeed: Math.round(data.wind.speed),\n      condition: data.weather[0].description,\n      icon: data.weather[0].icon,\n    };\n    cache.set(cacheKey, { data: weather, created: Date.now() });\n    return weather;\n  } catch (error: any) {\n    if (error.response && error.response.status === 404) {\n      throw { status: 404, message: `City \"${city}\" not found.` };\n    }\n    throw { status: 500, message: `Failed to fetch weather for ${city}` };\n  }\n}\n\nexport async function fetchWeatherForCities(cities: string[], unit: 'metric' | 'imperial') {\n  // Remove duplicates; keep order\n  const uniqueCities = Array.from(new Set(cities.map(c => c.trim())));\n  if (uniqueCities.length < cities.length) {\n    throw { status: 400, message: 'Duplicate cities provided in request.' };\n  }\n  const results: WeatherData[] = [];\n  for (const city of uniqueCities) {\n    try {\n      const weather = await fetchWeather(city, unit);\n      results.push(weather);\n    } catch (err: any) {\n      throw { status: err.status || 500, message: err.message || 'Unknown error' };\n    }\n  }\n  return results;\n}\n",
                //             "server/middleware/errorHandler.ts":
                //                 "import { Request, Response, NextFunction } from 'express';\n\nexport function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {\n  const status = err.status || 500;\n  // Never expose API key or secrets in error\n  const message = err.message || 'Server error';\n  res.status(status).json({ error: message });\n}\n",
                //             "server/tests/weather.test.ts":
                //                 "import request from 'supertest';\nimport express from 'express';\nimport weatherRoutes from '../routes/weatherRoutes';\nimport { errorHandler } from '../middleware/errorHandler';\n\ndescribe('GET /api/weather/compare', () => {\n  const app = express();\n  app.use(express.json());\n  app.use('/api/weather', weatherRoutes);\n  app.use(errorHandler);\n\n  it('rejects calls with less than 3 cities', async () => {\n    const res = await request(app).get('/api/weather/compare?cities=London&cities=Paris');\n    expect(res.status).toBe(400);\n    expect(res.body.error).toMatch(/at least three/);\n  });\n\n  it('returns weather data for valid cities', async () => {\n    // Use real API key or mock implementation in CI\n    if (!process.env.OPENWEATHERMAP_API_KEY) return;\n    const res = await request(app).get('/api/weather/compare?cities=London&cities=Paris&cities=Berlin');\n    expect([200, 500, 502, 429]).toContain(res.status); // accept rate limit or errors\n    if (res.status === 200) {\n      expect(Array.isArray(res.body)).toBe(true);\n      expect(res.body.length).toBe(3);\n    }\n  }, 20000);\n\n  it('returns 404 for invalid city', async () => {\n    if (!process.env.OPENWEATHERMAP_API_KEY) return;\n    const res = await request(app).get('/api/weather/compare?cities=London&cities=NoSuchCity321&cities=Berlin');\n    expect([404,500].includes(res.status)).toBe(true);\n  });\n});\n",
                //         },
                //     },
                //     env: {
                //         "client/.env":
                //             "VITE_BACKEND_URL=http://localhost:3001\nVITE_FRONTEND_PORT=5173\n",
                //         "client/.env.example": "VITE_BACKEND_URL=\nVITE_FRONTEND_PORT=\n",
                //         "server/.env":
                //             "OPENWEATHERMAP_API_KEY=your-real-openweathermap-api-key\nBACKEND_PORT=3001\n",
                //         "server/.env.example": "OPENWEATHERMAP_API_KEY=\nBACKEND_PORT=\n",
                //     },
                //     git: {
                //         branchName: "feature/WEAT-1-implement-multi-city-weather-comparison-table",
                //         commitMessage: "[WEAT-1] Implement Multi-City Weather Comparison Table",
                //         prDescription: {
                //             summary:
                //                 "Implemented a multi-city weather comparison table allowing users to view weather data for 3+ cities side-by-side. Includes CitySearch component, backend OpenWeatherMap API integration, unit selection, and dynamic updating.",
                //             filesChanged: [
                //                 "client/src/pages/ComparePage.tsx",
                //                 "client/src/components/WeatherTable.tsx",
                //                 "client/src/components/CitySearch.tsx",
                //                 "client/src/components/CityItem.tsx",
                //                 "client/src/services/weatherService.ts",
                //                 "server/routes/weatherRoutes.ts",
                //                 "server/controllers/weatherController.ts",
                //             ],
                //             jiraLink: "https://yorkhackathonteam15.atlassian.net/browse/WEAT-1",
                //         },
                //     },
                //     jiraComment: {
                //         qaTestSteps: [
                //             "1. Go to the Compare Page.",
                //             "2. Add at least three cities using the City Search component.",
                //             "3. Verify that the weather data (temperature, humidity, wind speed, conditions) is displayed correctly for each city in the comparison table.",
                //             "4. Add and remove cities to ensure the table updates dynamically.",
                //             "5. Test with invalid city names to ensure appropriate error handling.",
                //             "6. Test with a large number of cities to ensure performance remains acceptable.",
                //         ],
                //         peerReviewChecklist: [
                //             "✅ Code follows lint rules (ESLint, Prettier).",
                //             "✅ Handles edge cases (e.g., invalid city names, API errors).",
                //             "✅ Test coverage ≥80%.",
                //             "✅ API key is securely stored and not exposed.",
                //             "✅ UI is responsive and user-friendly.",
                //             "✅ Error handling is implemented appropriately.",
                //         ],
                //         recommendedTransition: "To Do → Code Review",
                //     },
                // };

                console.log("Generated Code:", setupData);
                console.log("Generated Code::::::setup::::::", setupData.setup);

                // const workspaceFolders = vscode.workspace.workspaceFolders;
                // if (!workspaceFolders || workspaceFolders.length === 0) {
                //     vscode.window.showErrorMessage("❌ No workspace folder open.");
                //     return;
                // }
                // const rootPath = workspaceFolders[0].uri.fsPath;

                const rootPath = "d:/MagicBox";

                function runInTerminal(name: string, commands: string[], cwd: string) {
                    const terminal = vscode.window.createTerminal({
                        name,
                        cwd,
                    });
                    terminal.show();
                    for (const cmd of commands) {
                        terminal.sendText(cmd);
                    }
                }

                // 🧠 Move this out as a reusable function
                function writeGeneratedFiles(fileMap: Record<string, string>, rootPath: string) {
                    for (const [relativePath, content] of Object.entries(fileMap)) {
                        const absolutePath = path.join(rootPath, relativePath);
                        const dir = path.dirname(absolutePath);

                        fs.mkdirSync(dir, { recursive: true });
                        fs.writeFileSync(absolutePath, content, "utf-8");
                    }
                }

                vscode.window.withProgress(
                    {
                        location: vscode.ProgressLocation.Notification,
                        title: "⚙️ Running setup commands...",
                        cancellable: false,
                    },
                    async progress => {
                        // runInTerminal(
                        //     "Frontend Setup",
                        //     setupData.setup.frontend.commands,
                        //     `${rootPath}/client`
                        // );
                        // runInTerminal(
                        //     "Backend Setup",
                        //     setupData.setup.backend.commands,
                        //     `${rootPath}/server`
                        // );

                        // // ⏳ Wait ~15s to allow setup commands to complete
                        // await new Promise(resolve => setTimeout(resolve, 15000));

                        progress.report({ message: "✍️ Writing files to workspace..." });

                        writeGeneratedFiles(setupData.files.fileMap, rootPath);
                        writeGeneratedFiles(setupData.env, rootPath);

                        vscode.window.showInformationMessage(
                            "✅ Project scaffolded successfully! You can now run the frontend and backend.",
                            "Open Client Terminal",
                            "Open Server Terminal"
                        );
                    }
                );
            } catch (err: any) {
                console.error("❌ Failed to fetch Jira ticket or extract requirements:", err);
                vscode.window.showErrorMessage("❌ Failed to fetch Jira ticket or analyze it.");
            }

            break;

        default:
            logger.warn("⚠️ Unknown message type:", message.type);
    }
}
