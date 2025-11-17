// client/src/pages/report/LARPage.tsx
// ===== LINE ACCEPTANCE RATE (LAR) REPORT PAGE =====
// Complete Separation Entity Architecture - LAR Report Visualization
// Manufacturing/Quality Control System - Orange Theme Implementation

import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import { getLARChart, getLARDefect, getAvailableModels, getFiscalYears, getWorkWeeks } from '../../services/reportService';

// ============ INTERFACES ============

interface LARData {
  week: string;
  larPercentage: number;
  totalDPPM: number;
  inspectionLot: number;
  passLot: number;
  failLot: number;
  dataNG: number;
  dataInspection: number;
  defects: {
    [key: string]: number;
  };
}

interface DefectLegendItem {
  name: string;
  color: string;
}


// ============ MAIN COMPONENT ============

const LARPage: React.FC = () => {
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);  // Start as false - no auto-load
  const [larData, setLarData] = useState<LARData[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [fiscalYearFrom, setFiscalYearFrom] = useState<string>('');
  const [wwFrom, setWwFrom] = useState<string>('');
  const [fiscalYearTo, setFiscalYearTo] = useState<string>('');
  const [wwTo, setWwTo] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [availableFiscalYears, setAvailableFiscalYears] = useState<string[]>([]);
  const [availableWorkWeeksFrom, setAvailableWorkWeeksFrom] = useState<string[]>([]);
  const [availableWorkWeeksTo, setAvailableWorkWeeksTo] = useState<string[]>([]);

  // ============ DATA FETCHING ============

  // Fetch available models and fiscal years on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      console.log('🔄 Fetching available filters...');

      // Fetch models
      const modelsResult = await getAvailableModels();
      console.log('📊 Models API result:', modelsResult);
      if (modelsResult.success && modelsResult.data) {
        console.log(`✅ Setting ${modelsResult.data.length} models:`, modelsResult.data);
        setAvailableModels(modelsResult.data);
      } else {
        console.warn('⚠️ Failed to fetch models:', modelsResult.message);
      }

      // Fetch fiscal years
      const fyResult = await getFiscalYears();
      console.log('📊 Fiscal Years API result:', fyResult);
      if (fyResult.success && fyResult.data) {
        console.log(`✅ Setting ${fyResult.data.length} fiscal years:`, fyResult.data);
        setAvailableFiscalYears(fyResult.data);
      } else {
        console.warn('⚠️ Failed to fetch fiscal years:', fyResult.message);
      }
    };
    fetchFilters();
  }, []);

  // Fetch work weeks for "From" fiscal year
  useEffect(() => {
    const fetchWorkWeeksFrom = async () => {
      if (fiscalYearFrom) {
        console.log('🔄 Fetching work weeks for fiscal year FROM:', fiscalYearFrom);
        const wwResult = await getWorkWeeks(fiscalYearFrom);
        console.log('📊 Work Weeks FROM API result:', wwResult);
        if (wwResult.success && wwResult.data) {
          console.log(`✅ Setting ${wwResult.data.length} work weeks FROM:`, wwResult.data);
          setAvailableWorkWeeksFrom(wwResult.data);
          // Clear current WW From selection when fiscal year changes
          setWwFrom('');
        } else {
          console.warn('⚠️ Failed to fetch work weeks FROM:', wwResult.message);
        }
      } else {
        // Clear work weeks if no fiscal year selected
        setAvailableWorkWeeksFrom([]);
        setWwFrom('');
      }
    };
    fetchWorkWeeksFrom();
  }, [fiscalYearFrom]);

  // Fetch work weeks for "To" fiscal year
  useEffect(() => {
    const fetchWorkWeeksTo = async () => {
      if (fiscalYearTo) {
        console.log('🔄 Fetching work weeks for fiscal year TO:', fiscalYearTo);
        const wwResult = await getWorkWeeks(fiscalYearTo);
        console.log('📊 Work Weeks TO API result:', wwResult);
        if (wwResult.success && wwResult.data) {
          console.log(`✅ Setting ${wwResult.data.length} work weeks TO:`, wwResult.data);
          setAvailableWorkWeeksTo(wwResult.data);
          // Clear current WW To selection when fiscal year changes
          setWwTo('');
        } else {
          console.warn('⚠️ Failed to fetch work weeks TO:', wwResult.message);
        }
      } else {
        // Clear work weeks if no fiscal year selected
        setAvailableWorkWeeksTo([]);
        setWwTo('');
      }
    };
    fetchWorkWeeksTo();
  }, [fiscalYearTo]);

  // Fetch LAR data
  const fetchLARData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching LAR report data...');

      // Build query parameters (station='OQA' and round=1 are fixed on server)
      const queryParams: any = {};

      // Use fiscal year from "From" filter, or "To" filter if only "To" is selected
      if (fiscalYearFrom) {
        queryParams.yearFrom = fiscalYearFrom;
      }
      if (fiscalYearTo) {
        queryParams.yearTo = fiscalYearTo;
      }

      if (wwFrom) queryParams.wwFrom = wwFrom;
      if (wwTo) queryParams.wwTo = wwTo;
      if (selectedModel) queryParams.model = selectedModel;

      // Fetch LAR chart data from API (simplified format without defect breakdown)
      const result = await getLARChart(queryParams);
      console.log('📊 LAR Chart API Response:', result);

      if (result.success && result.data && result.data.length > 0) {
        console.log(`✅ LAR data fetched: ${result.data.length} records`);
        console.log('📋 First record data sample:', result.data[0]);

        // Group data by week
        const weekMap = new Map<string, LARData>();

        for (const record of result.data) {
          if (!weekMap.has(record.ww)) {
            weekMap.set(record.ww, {
              week: 'WW '+ record.ww,
              dataNG: record.total_ng || 0,
              dataInspection: record.total_inspection || 0,
              larPercentage: parseFloat(String(record.lar)) || 0,
              totalDPPM: parseFloat(String(record.dppm)) || 0,
              inspectionLot: parseInt(String(record.total_lot)) || 0,
              passLot: parseInt(String(record.total_pass_lot)) || 0,
              failLot: parseInt(String(record.total_fail_lot)) || 0,
              defects: {}
            });
          }
        }

        // Fetch defect data separately
        console.log('🔄 Fetching LAR defect data...');
        const defectResult = await getLARDefect(queryParams);
        console.log('📊 LAR Defect API Response:', defectResult);

        if (defectResult.success && defectResult.data && defectResult.data.length > 0) {
          console.log(`✅ Defect data fetched: ${defectResult.data.length} records`);

          // Merge defect data into weekMap using ww as key
          for (const defectRecord of defectResult.data) {
            const weekData = weekMap.get(defectRecord.ww);
            if (weekData && defectRecord.defectname) {
              // Add or sum up the defect quantity for this defect type
              if (!weekData.defects[defectRecord.defectname]) {
                weekData.defects[defectRecord.defectname] = 0;
              }
              weekData.defects[defectRecord.defectname] += defectRecord.ng_qty || 0;
            }
          }
          console.log('✅ Defect data merged into week data');
        } else {
          console.warn('⚠️ No defect data found or error fetching defects:', defectResult.message);
        }

        const transformedData: LARData[] = Array.from(weekMap.values());

        console.log('🔄 Transformed data:', transformedData);
        console.log('🔄 Setting larData state with', transformedData.length, 'items');
        setLarData(transformedData);
        console.log('✅ larData state updated');
      } else {
        const errorMsg = result.message || 'No LAR data available in database';
        console.warn('⚠️ LAR fetch warning:', errorMsg);
        console.warn('⚠️ Result:', result);
        setError(errorMsg);
        // Set empty data instead of mock data
        setLarData([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching LAR data';
      console.error('❌ LAR fetch exception:', errorMsg);
      setError(errorMsg);
      // Set empty data instead of mock data
      setLarData([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch on component mount - DISABLED (user must click Apply to load data)
  // useEffect(() => {
  //   fetchLARData();
  // }, []);

  // ============ CHART DATA TRANSFORMATION ============

  const chartData = larData.map(item => ({
    week: item.week,
    larPercentage: item.larPercentage,
    totalDPPM: item.totalDPPM,
    inspectionLot: item.inspectionLot,
    passLot: item.passLot,
    failLot: item.failLot,
    dataNG:item.dataNG,
    dataInspection:item.dataInspection,
    ...item.defects  // Spread all defect data dynamically
  }));

  // ============ DYNAMIC DEFECT LEGEND ============

  // Build defect legend from actual data
  const allDefectNames = new Set<string>();
  larData.forEach(week => {
    Object.keys(week.defects).forEach(defectName => {
      allDefectNames.add(defectName);
    });
  });

  const defectColors = [
    '#F97316', // Orange
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#EC4899', // Pink
    '#14B8A6', // Teal
    '#F59E0B', // Yellow
    '#6366F1'  // Indigo
  ];

  const dynamicDefectLegend: DefectLegendItem[] = Array.from(allDefectNames).map((name, index) => ({
    name,
    color: defectColors[index % defectColors.length]
  }));

  // ============ CUSTOM TOOLTIP ============

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
          <h3 className="font-semibold text-gray-900 mb-2">{label}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600 font-medium">LAR: {data.larPercentage.toFixed(2)}%</p>
            <p className="text-gray-600">Total Lot Pass: {data.passLot}</p>
            <p className="text-gray-600">Total Lot inspection: {data.inspectionLot}</p>
            <p className="text-orange-600">DPPM: {data.totalDPPM.toFixed(2)}</p>
            <p className="text-gray-600">Total NG: {data.dataNG}</p>
            <p className="text-gray-600">Total inspection: {data.dataInspection.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</p>

            {/* Defect Breakdown */}
            <div className="border-t border-gray-200 mt-2 pt-2">
              <p className="font-medium text-gray-700 mb-1">Defect Breakdown:</p>
              {dynamicDefectLegend.map((defect) => {
                const quantity = data[defect.name] || 0;
                if (quantity > 0) {
                  return (
                    <div key={defect.name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-3 h-3 rounded mr-2"
                          style={{ backgroundColor: defect.color }}
                        />
                        <span className="text-gray-600">{defect.name}:</span>
                      </div>
                      <span className="font-medium text-gray-900 ml-2">{Math.round(quantity)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // ============ RENDER METHODS ============

  const renderHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">OQA VMI LAR {selectedModel}</h1>
          <p className="text-gray-600 mt-1">Line Acceptance Rate Report</p>
        </div>
        <div className="flex items-center space-x-4 mt-4 lg:mt-0">

        </div>
      </div>
    </div>
  );

  const renderFilters = () => {
    console.log('🎨 Rendering filters - availableModels:', availableModels, 'availableFiscalYears:', availableFiscalYears);

    // Validation function to check if all required fields are selected
    const isFilterValid = (): boolean => {
      return !!(fiscalYearFrom && wwFrom && fiscalYearTo && wwTo && selectedModel);
    };

    const handleApplyFilters = () => {
      // Validate all fields are selected
      if (!fiscalYearFrom) {
        alert('Please select Fiscal Year From');
        return;
      }
      if (!wwFrom) {
        alert('Please select WW From');
        return;
      }
      if (!fiscalYearTo) {
        alert('Please select Fiscal Year To');
        return;
      }
      if (!wwTo) {
        alert('Please select WW To');
        return;
      }
      if (!selectedModel) {
        alert('Please select a Model');
        return;
      }

      // All validations passed, fetch data
      fetchLARData();
    };

    const handleClearFilters = () => {
      setFiscalYearFrom('');
      setWwFrom('');
      setFiscalYearTo('');
      setWwTo('');
      setSelectedModel('');
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Filter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">
          {/* Fiscal Year From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiscal Year From <span className="text-red-500">*</span>
            </label>
            <select
              value={fiscalYearFrom}
              onChange={(e) => setFiscalYearFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select FY</option>
              {availableFiscalYears.map((fy) => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>

          {/* WW From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WW From <span className="text-red-500">*</span>
            </label>
            <select
              value={wwFrom}
              onChange={(e) => setWwFrom(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!fiscalYearFrom}
            >
              <option value="">{fiscalYearFrom ? 'Select WW' : 'Select FY first'}</option>
              {availableWorkWeeksFrom.map((ww) => (
                <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          {/* Fiscal Year To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiscal Year To <span className="text-red-500">*</span>
            </label>
            <select
              value={fiscalYearTo}
              onChange={(e) => setFiscalYearTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select FY</option>
              {availableFiscalYears.map((fy) => (
                <option key={fy} value={fy}>{fy}</option>
              ))}
            </select>
          </div>

          {/* WW To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              WW To <span className="text-red-500">*</span>
            </label>
            <select
              value={wwTo}
              onChange={(e) => setWwTo(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!fiscalYearTo}
            >
              <option value="">{fiscalYearTo ? 'Select WW' : 'Select FY first'}</option>
              {availableWorkWeeksTo.map((ww) => (
                <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="">Select Model</option>
              {availableModels.map((model) => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={handleApplyFilters}
              disabled={!isFilterValid()}
              className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
              title={!isFilterValid() ? 'Please select all required fields' : 'Apply filters'}
            >
              Apply
            </button>
            <button
              onClick={handleClearFilters}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Clear
            </button>            
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">LAR VMI {selectedModel}</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">

          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 60, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="week"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            {/* Left Y-axis for LAR % */}
            <YAxis
              yAxisId="left"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'LAR %', angle: -90, position: 'insideLeft' }}
              domain={[0, 100]}
            />
            {/* Right Y-axis for Defect Quantity */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6B7280' }}
              label={{ value: 'DPPM', angle: 90, position: 'insideRight' }}
            />
            
             {/*
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              iconType="line"
            />
            */}

            {/* LAR % Line */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="larPercentage"
              stroke="#3B82F6"
              strokeWidth={3}
              name="LAR %"
              dot={{ fill: '#3B82F6', r: 4 }}
              activeDot={{ r: 6 }}
              label={{
                position: 'top',
                content: ({ x, y, value }: any) => (
                  <text
                    x={x}
                    y={y - 10}
                    fill="#3B82F6"
                    fontSize={11}
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {value.toFixed(2)}%
                  </text>
                )
              }}
            />

            {/* Stacked Defect Bars */}
            {dynamicDefectLegend.map((defect, index) => (
              <Bar
                key={defect.name}
                yAxisId="right"
                dataKey={defect.name}
                stackId="defects"
                fill={defect.color}
                name={defect.name}
                radius={index === dynamicDefectLegend.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );

  const renderDataTable = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">     
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-r border-gray-300 w-48">
                DEFECT
              </th>
              {larData.map((item) => (
                <th
                  key={item.week}
                  className={`px-3 py-2 text-center text-sm font-medium border-r border-gray-300 min-w-20 ${
                    item.inspectionLot === 0 ? 'bg-gray-400 text-white' : 'text-gray-700'
                  }`}
                >
                  {item.week}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Defect Type Rows */}
            {dynamicDefectLegend.map((defectType) => {
              return (
                <tr key={defectType.name} className="border-b border-gray-200">
                  <td
                    className="px-4 py-1 text-sm font-medium text-white border-r border-gray-300 text-left"
                    style={{ backgroundColor: defectType.color }}
                  >
                    {defectType.name}
                  </td>
                  {larData.map((item) => {
                    const value = item.defects[defectType.name] || 0;
                    const isZeroInspectionLot = item.inspectionLot === 0;
                    return (
                      <td
                        key={item.week}
                        className={`px-3 py-1 text-center text-sm border-r border-gray-300 ${
                          isZeroInspectionLot ? 'bg-gray-400 text-white' : ''
                        }`}
                      >
                        {Math.round(value)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
            
            {/* LAR Percentage Row */}
            <tr className="bg-blue-100 border-b border-gray-200">
              <td className="px-4 py-1 text-sm font-medium text-blue-800 border-r border-gray-300">
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  % LAR
                </div>
              </td>
              {larData.map((item) => {
                const isZeroInspectionLot = item.inspectionLot === 0;
                return (
                  <td
                    key={item.week}
                    className={`px-3 py-1 text-center text-sm font-bold border-r border-gray-300 ${
                      isZeroInspectionLot ? 'bg-gray-400 text-white' : 'text-blue-800'
                    }`}
                  >
                    {item.larPercentage.toFixed(2)}%
                  </td>
                );
              })}
            </tr>
            
            {/* Inspection Lot Row */}
            <tr className="bg-green-50 border-b border-gray-200">
              <td className="px-4 py-1 text-sm font-medium text-green-800 border-r border-gray-300">
                INSPECTION LOT
              </td>
              {larData.map((item) => {
                const isZeroInspectionLot = item.inspectionLot === 0;
                return (
                  <td
                    key={item.week}
                    className={`px-3 py-1 text-center text-sm border-r border-gray-300 ${
                      isZeroInspectionLot ? 'bg-gray-400 text-white font-bold' : 'text-green-800'
                    }`}
                  >
                    {item.inspectionLot}
                  </td>
                );
              })}
            </tr>
            
            {/* Total DPPM Row */}
            <tr className="bg-yellow-50">
              <td className="px-4 py-1 text-sm font-medium text-yellow-800 border-r border-gray-300">
                Total DPPM
              </td>
              {larData.map((item) => {
                const isZeroInspectionLot = item.inspectionLot === 0;
                return (
                  <td
                    key={item.week}
                    className={`px-3 py-1 text-center text-sm border-r border-gray-300 ${
                      isZeroInspectionLot ? 'bg-gray-400 text-white' : 'text-yellow-800'
                    }`}
                  >
                    {Math.round(item.totalDPPM)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
 

  // ============ MAIN RENDER ============

  // ============ LOGGING STATE ============
  console.log('🎨 Rendering LARPage - loading:', loading, 'larData.length:', larData.length);

  // ============ LOADING STATE ============

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading LAR Report...</p>
        </div>
      </div>
    );
  }

  // ============ EMPTY STATE ============

  if (!loading && larData.length === 0) {
    console.log('📭 Showing empty state - no data available');
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex mb-6" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                  </svg>
                  Home
                </a>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">Reports</span>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">LAR Report</span>
                </div>
              </li>
            </ol>
          </nav>

          {/* Filters */}
          {renderFilters()}

          {/* Error Message */}
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Empty State Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="mt-4 text-lg font-medium text-gray-900">No Data Loaded</h3>
            <p className="mt-2 text-sm text-gray-500">
              Please select filter criteria (Work Week range and/or Model) and click <strong>Apply</strong> to load LAR report data.
              <br />
              You can also click the <strong>Refresh</strong> button to load all available data.
            </p>
            <div className="mt-6">
              <button
                onClick={() => fetchLARData()}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Load All Data
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER ============

  console.log('✨ Rendering main content with', larData.length, 'data items');

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
 
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <a href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-orange-600">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z"></path>
                </svg>
                Dashboard
              </a>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <a href="/reports" className="ml-1 text-sm font-medium text-gray-700 hover:text-orange-600 md:ml-2">Reports</a>
              </div>
            </li>
            <li aria-current="page">
              <div className="flex items-center">
                <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                </svg>
                <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">LAR Report</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Filters */}
        {renderFilters()}

        {/* Main Content */}
        {/*renderHeader()*/}
        {renderChart()}
        {renderDataTable()}
 
      </div>
    </div>
  );
};

export default LARPage;