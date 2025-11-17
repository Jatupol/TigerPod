// client/src/pages/report/OverallOQAPage.tsx
 

import React, { useState, useEffect } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend } from 'recharts';
import { getOQADPPMOverallChart, getOQADPPMOverallDefect, getFiscalYears, getWorkWeeks } from '../../services/reportService';
// Import utilities
import { getMonthTrendName, formatNumber } from '../../utils';
// ============ INTERFACES ============

interface OQADPPMOverallData {
  month: string;
  larPercentage: number;
  totalDPPM: number;
  dppmTarget: number;
  isHighlighted?: string;
  defects: {
    [key: string]: number;
  };
}

interface DefectLegendItem {
  name: string;
  color: string;
}

 

// ============ MAIN COMPONENT ============

const OverallOQAPage: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sgtData, setSgtData] = useState<OQADPPMOverallData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [rawDefectData, setRawDefectData] = useState<any[]>([]);

  // Filter states
  const [fiscalYear, setfiscalYear] = useState<string>('');
  const [ww, setww] = useState<string>('');
  const [availableFiscalYears, setAvailableFiscalYears] = useState<string[]>([]);
  const [availableWorkWeeksFrom, setAvailableWorkWeeks] = useState<string[]>([]);


  // ============ DATA FETCHING ============

  // Fetch available models and fiscal years on component mount
  useEffect(() => {
    const fetchFilters = async () => {
      console.log('🔄 Fetching available filters...'); 

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
    const fetchWorkWeeks = async () => {
      if (fiscalYear) {
        console.log('🔄 Fetching work weeks for fiscal year FROM:', fiscalYear);
        const wwResult = await getWorkWeeks(fiscalYear);
        console.log('📊 Work Weeks FROM API result:', wwResult);
        if (wwResult.success && wwResult.data) {
          console.log(`✅ Setting ${wwResult.data.length} work weeks FROM:`, wwResult.data);
          setAvailableWorkWeeks(wwResult.data);
          setww('');
        } else {
          console.warn('⚠️ Failed to fetch work weeks FROM:', wwResult.message);
        }
      } else {
        setAvailableWorkWeeks([]);
        setww('');
      }
    };
    fetchWorkWeeks();
  }, [fiscalYear]);


  // Fetch OQA DPPM Overall data
  const fetchOQADPPMOverallData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Fetching OQA DPPM Overall report data...');

      // Build query parameters
      const queryParams: any = {};

      if (fiscalYear) {
        queryParams.year = fiscalYear;
      }
 
      if (ww) queryParams.ww = ww;
 

      // Fetch OQA DPPM Overall chart data from API
      const result = await getOQADPPMOverallChart(queryParams);
      console.log('📊 OQA DPPM Overall Chart API Response:', result);

      if (result.success && result.data && result.data.length > 0) {
        console.log(`✅ SGT IQA data fetched: ${result.data.length} records`);
        console.log('📋 First record data sample:', result.data[0]);

        // Group data by yearmonth
        const monthMap = new Map<string, OQADPPMOverallData>();

        for (const record of result.data) {
          if (!monthMap.has(record.yearmonth)) {
            monthMap.set(record.yearmonth, {
              month: record.yearmonth,
              dppmTarget: 150,        
              larPercentage: parseFloat(String(record.lar)) || 0,
              totalDPPM: parseFloat(String(record.dppm)) || 0, 
              defects: {}
            });
          }
        }

        // Fetch defect data separately
        console.log('🔄 Fetching OQA DPPM Overall defect data...');
        const defectResult = await getOQADPPMOverallDefect(queryParams);
        console.log('📊 OQA DPPM Overall Defect API Response:', defectResult);

        if (defectResult.success && defectResult.data && defectResult.data.length > 0) {
          console.log(`✅ Defect data fetched: ${defectResult.data.length} records`);
          console.log('📋 First defect record sample:', defectResult.data[0]);
          console.log('📋 Defect record keys:', Object.keys(defectResult.data[0] || {}));

          // Store raw defect data for summary cards
          setRawDefectData(defectResult.data);

          // Merge defect data into monthMap using yearmonth as key
          for (const defectRecord of defectResult.data) {
            console.log('🔍 Processing defect record:', {
              yearmonth: defectRecord.yearmonth,
              defectname: defectRecord.defectname,
              total_ng: defectRecord.ng_qty
            });

            const monthData = monthMap.get(defectRecord.yearmonth);
            if (monthData && defectRecord.defectname) {
              // Add or sum up the defect quantity for this defect type
              if (!monthData.defects[defectRecord.defectname]) {
                monthData.defects[defectRecord.defectname] = 0;
              }
              const quantity = defectRecord.ng_qty || 0;
              monthData.defects[defectRecord.defectname] += quantity;
              console.log(`✅ Added ${quantity} to ${defectRecord.defectname} for month ${defectRecord.yearmonth}`);
            } else {
              console.warn('⚠️ Could not find month data or defectname is missing:', {
                monthDataExists: !!monthData,
                defectname: defectRecord.defectname,
                yearmonth: defectRecord.yearmonth
              });
            }
          }
          console.log('✅ Defect data merged into month data');
          console.log('📋 MonthMap after merge:', Array.from(monthMap.entries()));
        } else {
          console.warn('⚠️ No defect data found or error fetching defects:', defectResult.message);
          setRawDefectData([]);
        }

        const transformedData: OQADPPMOverallData[] = Array.from(monthMap.values());

        console.log('🔄 Transformed data:', transformedData);
        console.log('🔄 Transformed data with defects:', transformedData.map(d => ({ month: d.month, defects: d.defects })));
        console.log('🔄 Setting sgtData state with', transformedData.length, 'items');
        setSgtData(transformedData);
        console.log('✅ sgtData state updated');
      } else {
        const errorMsg = result.message || 'No OQA DPPM Overall data available in database';
        console.warn('⚠️ SGT IQA fetch warning:', errorMsg);
        console.warn('⚠️ Result:', result);
        setError(errorMsg);
        setSgtData([]);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error fetching OQA DPPM Overall data';
      console.error('❌ SGT IQA fetch exception:', errorMsg);
      setError(errorMsg);
      setSgtData([]);
    } finally {
      setLoading(false);
    }
  };

  // ============ CHART DATA TRANSFORMATION ============

  const chartData = sgtData.map(item => ({
    month: item.month,
    displayMonth: getMonthTrendName(item.month),
    larPercentage: item.larPercentage,
    totalDPPM: item.totalDPPM,
    dppmTarget: 150,
    isHighlighted: item.isHighlighted,
    ...item.defects  // Spread all defect data dynamically
  }));

  // ============ DYNAMIC DEFECT LEGEND ============

  // Build defect legend from actual data
  const allDefectNames = new Set<string>();
  sgtData.forEach(month => {
    Object.keys(month.defects).forEach(defectName => {
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
          <h3 className="font-semibold text-gray-900 mb-2">{data.displayMonth}</h3>
          <div className="space-y-1 text-sm">
            <p className="text-blue-600 font-medium">LAR: {data.larPercentage?.toFixed(2) || 0}%</p>
            <p className="text-orange-600">DPPM: {formatNumber((data.totalDPPM || 0).toFixed(2))}</p>
            <p className="text-gray-600">DPPM Target: {data.dppmTarget || 150}</p>

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
          <h1 className="text-2xl font-bold text-gray-900">OQA DPPM Overall</h1>
          <p className="text-gray-600 mt-1">OQA DPPM Overall Trend Analysis</p>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => {
    console.log('🎨 Rendering filters - availableFiscalYears:', availableFiscalYears);

     const isFilterValid = (): boolean => {
      return !!(fiscalYear && ww );
    };

    const handleApplyFilters = () => {
      // Validate all fields are selected
      if (!fiscalYear) {
        alert('Please select Fiscal Year');
        return;
      }
      if (!ww) {
        alert('Please select WW');
        return;
      }

 
      // All validations passed, fetch data
      fetchOQADPPMOverallData();
    };

    const handleClearFilters = () => {
      setfiscalYear('');
      setww('');
    };

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        {/* Filter Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-6">
          {/* Fiscal Year From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fiscal Year <span className="text-red-500">*</span>
            </label>
            <select
              value={fiscalYear}
              onChange={(e) => setfiscalYear(e.target.value)}
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
              WW <span className="text-red-500">*</span>
            </label>
            <select
              value={ww}
              onChange={(e) => setww(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              disabled={!fiscalYear}
            >
              <option value="">{fiscalYear ? 'Select WW' : 'Select FY first'}</option>
              {availableWorkWeeksFrom.map((ww) => (
                <option key={ww} value={ww}>{ww.padStart(2, '0')}</option>
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
        <h2 className="text-lg font-semibold text-gray-900">NHK OQA DPPM Overall</h2>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Period: Apr'24 - May'24
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96 w-full relative">
        {/* Background green area to match the image */}
        <div className="absolute inset-0 bg-green-100 opacity-30 rounded"></div>

        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 20, right: 80, left: 60, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="displayMonth"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              angle={0}
              textAnchor="middle"
              height={60}
              interval={0}
            />
            {/* Left Y-axis for LAR % */}
            <YAxis
              yAxisId="left"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              label={{
                value: 'LAR %',
                angle: -90,
                position: 'insideLeft',
                style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
              }}
              domain={[0, 100]}
            />
            {/* Right Y-axis for Defect Quantity */}
            <YAxis
              yAxisId="right"
              orientation="right"
              axisLine={true}
              tickLine={true}
              tick={{ fontSize: 12, fill: '#374151' }}
              label={{
                value: 'Defect Quantity',
                angle: 90,
                position: 'insideRight',
                style: { textAnchor: 'middle', fontWeight: 'bold', fontSize: '14px' }
              }}
            />

            <Tooltip content={<CustomTooltip />} />

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

            {/* DPPM Target Line */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="dppmTarget"
              stroke="#EF4444"
              strokeWidth={2}
              strokeDasharray="5 5"
              name="DPPM Target (150)"
              dot={false}
              activeDot={false}
            />

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

          </ComposedChart>
        </ResponsiveContainer>

    
 
      </div>

      {/* Legend */}
       {/*
      <div className="flex justify-between items-start mt-6">
        <div className="bg-gray-50 p-4 rounded-lg flex-1 mr-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Defect Types:</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {dynamicDefectLegend.map((defect) => (
              <div key={defect.name} className="flex items-center">
                <div
                  className="w-4 h-4 rounded mr-2"
                  style={{ backgroundColor: defect.color }}
                ></div>
                <span className="text-xs text-gray-700">{defect.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-blue-500 mr-3"></div>
              <span className="text-sm text-gray-700 font-medium">LAR %</span>
            </div>
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-red-500 mr-3 border-dashed border-t-2 border-red-500" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-sm text-gray-700 font-medium">DPPM Target (150)</span>
            </div>
          </div>
        </div>
      </div>
      */}
    </div>
  );

  const renderSummaryCards = () => {
    // Get current FY/WW data by matching month with ww parameter
    // The month field should match the selected work week
    const currentData = sgtData.find(item => {
      // Extract the last 2 digits from month to compare with ww
      const monthWW = item.month.slice(-2);
      return monthWW === ww.padStart(2, '0');
    }) || (sgtData.length > 0 ? sgtData[0] : null);

    // Get LAR from current FY data
    const currentLAR = currentData ? currentData.larPercentage : 0;

    // Get total NG directly from raw defect data for the selected work week
    // Sum all ng_qty values where the last 2 digits of yearmonth match the selected ww
    const paddedWW = ww.padStart(2, '0');

    console.log('📊 Calculating Total NG from rawDefectData');
    console.log('🔍 Selected WW (padded):', paddedWW);
    console.log('📋 Raw defect data count:', rawDefectData.length);

    const matchingDefects = rawDefectData.filter(defectRecord => {
      // Extract the last 2 digits from yearmonth
      const monthWW = defectRecord.yearmonth ? defectRecord.yearmonth.slice(-2) : '';
      const matches = monthWW === paddedWW;

      if (matches) {
        console.log('✅ Matching defect:', {
          yearmonth: defectRecord.yearmonth,
          defectname: defectRecord.defectname,
          ng_qty: defectRecord.ng_qty
        });
      }

      return matches;
    });

    const totalNG = matchingDefects.reduce((sum, defectRecord) => {
      const qty =  parseInt(defectRecord.ng_qty || 0);
      console.log(`➕ Adding ${qty} (${defectRecord.defectname}) to sum`);
      return sum + qty ;
    }, 0);

    console.log('✅ Total NG calculated:', totalNG);
    console.log('📊 Number of matching defects:', matchingDefects.length);

    // Format FYWW display
    const fyww = fiscalYear && ww ? `${fiscalYear}/WW${ww.padStart(2, '0')}` : ww || 'N/A';

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* FYWW Card - Blue Gradient */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-100 uppercase tracking-wide">Fiscal Year / Work Week</p>
              <p className="text-3xl font-bold text-white mt-2 drop-shadow-md">{fyww}</p>
            </div>
 
          </div>
        </div>

        {/* LAR Card - Purple Gradient */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-100 uppercase tracking-wide">LAR %</p>
              <p className="text-3xl font-bold text-white mt-2 drop-shadow-md">{currentLAR.toFixed(2)}%</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total NG Card - Red/Orange Gradient */}
        <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105 hover:shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-100 uppercase tracking-wide">Total NG</p>
              <p className="text-3xl font-bold text-white mt-2 drop-shadow-md">{formatNumber(totalNG.toString())}</p>
            </div>
            <div className="p-3 bg-white bg-opacity-20 rounded-full backdrop-blur-sm">
              <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDataTable = () => {
    // Define metrics to display as rows based on SGTIQAData structure
    const metrics = [
      { key: 'totalDPPM', label: 'DPPM', colorClass: 'text-purple-700', format: (val: number) => Math.round(val).toString() },
      { key: 'dppmTarget', label: 'TNHK DPPM  Target(150)', colorClass: 'text-purple-700', format: (val: number) => Math.round(val).toString() },
      { key: 'larPercentage', label: '%LAR', colorClass: 'text-purple-600', format: (val: number) => `${val.toFixed(2)}%` },

    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Overall OQA TNHK : LAR & DPPM</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border-r border-gray-300 w-48">
                  Metric / Defect
                </th>
                {sgtData.map((item, index) => (
                  <th
                    key={`${item.month}-${index}`}
                    className={`px-3 py-2 text-center text-sm font-medium border-r border-gray-300 min-w-20 bg-green-100`}
                  >
                    {getMonthTrendName(item.month)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>

              {/* Metric Rows */}
              {metrics.map((metric) => (
                <tr
                  key={metric.key}
                  className="hover:bg-gray-50 border-b border-gray-200"
                >
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-300">
                    {metric.label}
                  </td>
                  {sgtData.map((item, index) => {
                    const value = item[metric.key as keyof OQADPPMOverallData] as number;

                    return (
                      <td
                        key={`${item.month}-${index}`}
                        className={`px-3 py-2 whitespace-nowrap text-center text-sm font-medium border-r border-gray-300 bg-green-100`}
                      >
                        {formatNumber(metric.format(value))}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Defect Type Rows */}
              {dynamicDefectLegend.map((defectType) => {
                // Skip if name is empty or undefined
                if (!defectType.name || defectType.name.trim() === '') return null;
                return (
                  <tr key={defectType.name} className="border-b border-gray-200">
                    <td
                      className="px-4 py-1 text-sm font-medium text-white border-r border-gray-300 text-left"
                      style={{ backgroundColor: defectType.color }}
                    >
                      {defectType.name}
                    </td>
                    {sgtData.map((item, index) => {
                      const value = item.defects[defectType.name] || 0; 
                      return (
                        <td
                          key={`${item.month}-${index}`}
                          className={`px-3 py-1 text-center text-sm border-r border-gray-300 bg-green-100`}
                        >
                          {formatNumber(Math.round(value).toString())}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

            </tbody>
          </table>
        </div>
      </div>
    );
  };

 
  // ============ MAIN RENDER ============

  // ============ LOGGING STATE ============
  console.log('🎨 Rendering OverallOQAPage - loading:', loading, 'sgtData.length:', sgtData.length);

  // ============ LOADING STATE ============

  if (loading) {
    console.log('⏳ Showing loading state');
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading OQA DPPM Overall Report...</p>
        </div>
      </div>
    );
  }

  // ============ EMPTY STATE ============

  if (!loading && sgtData.length === 0) {
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
                  <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">Seagate IQA Weekly result </span>
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
              Please select filter criteria and click <strong>Apply</strong> to load OQA DPPM Overall report data.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ============ MAIN RENDER WITH DATA ============

  console.log('✨ Rendering main content with', sgtData.length, 'data items');

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
                <span className="ml-1 text-sm font-medium text-orange-600 md:ml-2">OQA DPPM Overall</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Filters */}
        {renderFilters()}

        {/* Summary Cards */}
        {renderSummaryCards()}

        {/* Main Content */}
        {renderHeader()}
        {renderChart()}
        {renderDataTable()}
      </div>
    </div>
  );
};

export default OverallOQAPage;