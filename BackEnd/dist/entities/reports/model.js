"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReportModel = void 0;
exports.createLARReportModel = createLARReportModel;
class ReportModel {
    constructor(db) {
        this.db = db;
    }
    async getLARChart(params = {}) {
        try {
            const { model, yearFrom, wwFrom, yearTo, wwTo } = params;
            console.log('🔧 LARReportModel.getLARReport called with params:', params);
            const values = [];
            if (yearFrom && wwFrom && yearTo && wwTo) {
                values.push(`${yearFrom}${wwFrom.toString()}`);
                values.push(`${yearTo}${wwTo.toString()}`);
            }
            if (model) {
                values.push(model);
            }
            const query = `
   
        SELECT
          *,
          (TOTAL_PASS_LOT /  NULLIF(TOTAL_LOT,0)) * 100.0 AS LAR,
          (Total_NG::float /  NULLIF(Total_Inspection::float,0)) *1000000.0 AS DPPM
        FROM (
          SELECT
            w.fy, w.ww, L.model || ' ' ||  L.version  as model,
            COUNT(L.lotno) AS TOTAL_LOT,
            COUNT(CASE WHEN L.judgment = true THEN 1 END)::Numeric AS TOTAL_PASS_LOT,
            COUNT(CASE WHEN L.judgment = false THEN 1 END)::Numeric AS TOTAL_FAIL_LOT,
            SUM(general_sampling_qty) Total_Inspection,
            SUM(ng_qty) Total_NG
          FROM public.tbweek w 
		  LEFT JOIN inspectiondata L ON (w.fy || w.ww) = (L.fy||L.ww) 
  				AND (L.model || ' ' ||  L.version)  = $3
				AND L.station = 'OQA'  AND L.round = 1
          LEFT JOIN defectdata D  ON L.inspection_no = D.inspection_no 
              WHERE (w.fy||w.ww) between $1 and $2
          GROUP BY w.fy, w.ww, L.model, L.version
        ) TB
        ORDER BY fy,ww

      `;
            const result = await this.db.query(query, values);
            console.log(`✅ LARReportModel.getLARChart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in LARChartModel.getLARReport:', error);
            throw new Error(`Failed to get LAR chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getLARDefect(params = {}) {
        try {
            const { model, yearFrom, wwFrom, yearTo, wwTo } = params;
            const conditions = [];
            const values = [];
            let paramIndex = 1;
            if (yearFrom && wwFrom && yearTo && wwTo) {
                conditions.push(`((fy || ww) BETWEEN $${paramIndex} AND $${paramIndex + 1})`);
                values.push(`${yearFrom}${wwFrom.toString()}`);
                values.push(`${yearTo}${wwTo.toString()}`);
                paramIndex += 2;
            }
            if (model) {
                conditions.push(`(model || ' ' || version) = $${paramIndex}`);
                values.push(model);
                paramIndex++;
            }
            const whereClause = conditions.join(' AND ');
            const query = `
        SELECT
            fy, 
            ww,
			      DefectName,
            ng_qty 
        FROM v_oqa_defect
        WHERE ${whereClause}
        order by fy, ww, DefectName
      `;
            console.log(`✅ getLARDefect where Clause:   ${whereClause}  `);
            const result = await this.db.query(query, values);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get LAR chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSeagateIQAResult(params) {
        try {
            const { year, ww } = params;
            console.log('🔧 LARReportModel.getLARReport called with params:', params);
            const values = [];
            if (year && ww) {
                values.push(`${year}${ww.toString()}`);
            }
            const query = `

        SELECT
            fy, ww, fyww, model, Total_Inspection_Lot
          , Acceptable_Lot, Rejected_Lot, Rejected_Qty
          , (Acceptable_Lot /  NULLIF(Total_Inspection_Lot,0)) * 100.0 AS LAR
        FROM (
          SELECT fy, ww, fy||ww as fyww, (P.product_families|| ' ' || P.versions) AS Model
          , COUNT(id) Total_Inspection_Lot
          , COUNT(CASE WHEN L.rej = 0 THEN 1 END)::Numeric Acceptable_Lot
          , COUNT(CASE WHEN L.rej > 0 THEN 1 END)::Numeric  Rejected_Lot
          , SUM(L.rej) Rejected_Qty
          FROM public.iqadata L
          INNER JOIN public.parts P ON L.item = P.partno
          WHERE (fy || ww)= $1
          GROUP BY fy, ww, P.product_families, P.versions
          ) TB

      `;
            const result = await this.db.query(query, values);
            console.log(`✅ LARReportModel.getLARChart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in LARChartModel.getLARReport:', error);
            throw new Error(`Failed to get SeagateIQAResult chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSGTIQATrendChart(params = {}) {
        try {
            const { model, product_type, year, ww } = params;
            console.log('🔧 SGT IQA Trend Chart called with params:', params);
            const values = [];
            let paramIndex = 1;
            if (year && ww) {
                values.push(`${year}${ww.toString()}`);
                paramIndex++;
            }
            const conditions = [`P.partno = Q.item`];
            if (model) {
                conditions.push(`(P.product_families || ' ' ||  P.versions ) = $${paramIndex}`);
                values.push(model);
                paramIndex++;
            }
            if (product_type) {
                conditions.push(`P.product_type = $${paramIndex}`);
                values.push(product_type);
                paramIndex++;
            }
            const whereClause = conditions.join(' AND ');
            const query = `
   
          SELECT *
          FROM (
            SELECT
              yearmonth, model, product_type,total_lot, total_pass_lot, total_fail_lot,
              total_inspection, total_ng,
              (TOTAL_PASS_LOT /  NULLIF(TOTAL_LOT,0)) * 100.0 AS LAR,
              (Total_NG::float /  NULLIF(Total_Inspection::float,0)) *1000000.0 AS DPPM
            FROM (
            -- TB_MM
              SELECT 
                (yymm||99)  yearmonth, P.product_families || ' ' ||  P.versions  as model, P.product_type,
                COUNT(lotno) AS TOTAL_LOT,
                COUNT(CASE WHEN rej = 0 THEN 1 END)::Numeric AS TOTAL_PASS_LOT,
                COUNT(CASE WHEN rej > 0 THEN 1 END)::Numeric AS TOTAL_FAIL_LOT,
                SUM(inspec) Total_Inspection,
                SUM(rej) Total_NG
              FROM 
              (
                WITH base AS (
                  SELECT TO_DATE(yearmonth, 'YYMM') start_month
                  FROM tbweek
                  WHERE  yearmonth = (SELECT yearmonth FROM tbweek WHERE fyww = $1)
                  GROUP BY yearmonth
                )
                SELECT TO_CHAR(m, 'YYMM') AS yymm
                FROM base,
                  generate_series(
                  start_month - INTERVAL '12 month',   
                  start_month,                         
                  INTERVAL '1 month'                   
              ) AS g(m)
            ) TB 
            INNER JOIN  tbweek W  ON W.yearmonth = TB.yymm
            LEFT JOIN  iqadata Q ON W.fyww  = (Q.fy||Q.ww)
            INNER JOIN  parts P ON ${whereClause}
            GROUP BY yymm, P.product_families, P.versions, P.product_type
            ) TB_MM

            UNION ALL

            SELECT
              (yearmonth||ww) yearmonth, '' model, '' product_type,
              COALESCE(total_lot, 0) total_lot, 
              COALESCE(total_pass_lot, 0) total_pass_lot, 
              COALESCE(total_fail_lot, 0) total_fail_lot,
              COALESCE(total_inspection, 0) total_inspection, 
              COALESCE(total_ng, 0) total_ng,
              COALESCE((TOTAL_PASS_LOT /  NULLIF(TOTAL_LOT,0)) * 100.0, 0) AS LAR,
              COALESCE((Total_NG::float /  NULLIF(Total_Inspection::float,0)) *1000000.0, 0) AS DPPM
            FROM tbweek w
            LEFT JOIN  (
            -- TB_WW
              SELECT (Q.fy||Q.ww) fyww ,
                COUNT(lotno) AS TOTAL_LOT,
                COUNT(CASE WHEN rej = 0 THEN 1 END)::Numeric AS TOTAL_PASS_LOT,
                COUNT(CASE WHEN rej > 0 THEN 1 END)::Numeric AS TOTAL_FAIL_LOT,
                SUM(inspec) Total_Inspection,
                SUM(rej) Total_NG
              FROM   iqadata Q  
              INNER  JOIN  parts P ON ${whereClause} 
              GROUP BY  Q.fy,Q.ww,P.product_families, P.versions, P.product_type
              ) TB_WW ON TB_WW.fyww  = w.fyww
              WHERE  w.yearmonth = (SELECT yearmonth FROM tbweek WHERE fyww = $1)
          ) TB   
          ORDER BY yearmonth

      `;
            const result = await this.db.query(query, values);
            console.log(`✅ SGT IQA Trend Chart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in SGT IQA Trend Chart:', error);
            throw new Error(`Failed to get SGT IQA Trend Chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getSGTIQATrendDefect(params = {}) {
        try {
            const { model, product_type, year, ww } = params;
            const values = [];
            if (year && ww) {
                values.push(`${year}${ww.toString()}`);
            }
            const conditions = [`P.partno = Q.item`];
            let paramIndex = 2;
            if (model) {
                conditions.push(`(P.product_families || ' ' ||  P.versions) = $${paramIndex}`);
                values.push(model);
                paramIndex++;
            }
            if (product_type) {
                conditions.push(`P.product_type = $${paramIndex}`);
                values.push(product_type);
                paramIndex++;
            }
            const whereClause = conditions.join(' AND ');
            const query = `
            SELECT yearmonth, defect,  rej
            FROM (
              -- WW
              SELECT yearmonth, defect,  SUM(rej) rej
              FROM (
                SELECT (W.yearmonth||W.ww) yearmonth, COALESCE(rej, 0) rej, 
                   P.product_families || ' ' ||  P.versions  as model,
                   CASE WHEN COALESCE(rej, 0) = 0 THEN ' ' ELSE COALESCE(defect, ' ') END defect
                FROM   tbweek W  
                LEFT JOIN  iqadata Q ON W.fyww  = (Q.fy||Q.ww)   
                LEFT JOIN  parts P ON ${whereClause}	
                WHERE  w.yearmonth = (SELECT yearmonth FROM tbweek WHERE fyww = $1) 
              ) TB_WW
              GROUP BY  yearmonth,defect 	
            
            UNION ALL
                -- MONTH
                SELECT yearmonth, defect  , sum(rej) rej
                FROM (
                  SELECT w.yearmonth||'99' yearmonth, COALESCE(rej, 0) rej, product_type, 
                    P.product_families || ' ' ||  P.versions  as model,
                    CASE WHEN COALESCE(rej, 0) = 0 THEN ' ' ELSE COALESCE(defect, ' ') END defect
                  FROM   tbweek W  
                  LEFT JOIN  iqadata Q ON W.fyww  = (Q.fy||Q.ww)   
                  LEFT JOIN  parts P ON ${whereClause}
                  WHERE  w.yearmonth = (SELECT yearmonth FROM tbweek WHERE fyww = $1)
                ) TB_MM
                GROUP BY  yearmonth,defect 
            )TB_ALL
            WHERE rej > 1		
            ORDER BY yearmonth
      `;
            const result = await this.db.query(query, values);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get LAR chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getOQADppmOverallChart(params = {}) {
        try {
            const { year, ww } = params;
            console.log('🔧 OQA DPPM OVerall Chart called with params:', params);
            const values = [];
            if (year && ww) {
                values.push(`${year}${ww.toString()}`);
            }
            const query = `
       SELECT yearmonth,  dppmTarget, total_lot, total_pass_lot, 
             total_fail_lot, total_inspection, total_ng, LAR, DPPM	   
      FROM (
      --TB_MM
            SELECT 
              (W.yearmonth||'99') yearmonth, 150 as dppmTarget,
              SUM(COALESCE(total_lot, 0)) total_lot, 
              SUM(COALESCE(total_pass_lot, 0)) total_pass_lot, 
              SUM(COALESCE(total_fail_lot, 0)) total_fail_lot,
                SUM(COALESCE(total_inspection, 0)) total_inspection, 
                SUM(COALESCE(total_ng, 0)) total_ng,
                COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(NULLIF(TOTAL_LOT, 0)), 0) * 100.0 AS LAR,
                COALESCE(SUM(Total_NG)::float /  SUM(NULLIF(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM
            FROM  public.tbweek W  
            LEFT JOIN v_oqa_dppm Q ON  Q.fy = w.fy AND Q.ww = w.ww          
            WHERE W.yearmonth 
              BETWEEN TO_CHAR(TO_DATE(tiger_fn_fiscalweekToyearmonth($1), 'YYMM') - INTERVAL '5 months', 'YYMM')
              AND tiger_fn_fiscalweekToyearmonth($1)   
            GROUP BY W.yearmonth 
            
            UNION ALL

        --TB_WW
            SELECT 
              (W.yearmonth||W.ww) yearmonth, 150 as dppmTarget,
              SUM(COALESCE(total_lot, 0)) total_lot, 
              SUM(COALESCE(total_pass_lot, 0)) total_pass_lot, 
              SUM(COALESCE(total_fail_lot, 0)) total_fail_lot,
                SUM(COALESCE(total_inspection, 0)) total_inspection, 
                SUM(COALESCE(total_ng, 0)) total_ng,
                COALESCE(SUM(TOTAL_PASS_LOT) /  SUM(NULLIF(TOTAL_LOT, 0)), 0) * 100.0 AS LAR,
                COALESCE(SUM(Total_NG)::float /  SUM(NULLIF(Total_Inspection::float,0)), 0) *1000000.0 AS DPPM
            FROM  public.tbweek W  
            LEFT JOIN v_oqa_dppm Q ON  Q.fy = w.fy AND Q.ww = w.ww          
            WHERE W.yearmonth  =  tiger_fn_fiscalweekToyearmonth($1) 
            GROUP BY W.yearmonth , W.ww
        ) TB
        ORDER BY yearmonth

      `;
            const result = await this.db.query(query, values);
            console.log(`✅ OQA DPPM OVerall Chart: Retrieved ${result.rows.length} records`);
            return result.rows;
        }
        catch (error) {
            console.error('❌ Error in OQA DPPM OVerall Chart:', error);
            throw new Error(`Failed to get OQA DPPM OVerall Chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getOQADppmOverallDefect(params = {}) {
        try {
            const { year, ww } = params;
            const values = [];
            if (year && ww) {
                values.push(`${year}${ww.toString()}`);
            }
            const query = `
        SELECT yearmonth, defectname, ng_qty
		    FROM (
          --TB_MM
          SELECT (W.yearmonth||'99') yearmonth, defectname, sum(ng_qty) ng_qty
          FROM public.tbweek W
          INNER JOIN public.v_oqa_defect D on D.fy = W.fy AND D.ww = W.ww
          WHERE W.yearmonth 
            BETWEEN TO_CHAR(TO_DATE(tiger_fn_fiscalweekToyearmonth($1), 'YYMM') - INTERVAL '5 months', 'YYMM')
            AND tiger_fn_fiscalweekToyearmonth($1)  
          GROUP BY W.yearmonth, defectname

          UNION ALL
		  
		      SELECT (W.yearmonth||W.ww) yearmonth, defectname, sum(ng_qty) ng_qty
          FROM public.tbweek W
          INNER JOIN public.v_oqa_defect D on D.fy = W.fy AND D.ww = W.ww
          WHERE W.yearmonth = tiger_fn_fiscalweekToyearmonth($1)  
          GROUP BY W.yearmonth, W.ww, defectname
        ) TB
		   ORDER BY yearmonth
      `;
            const result = await this.db.query(query, values);
            return result.rows;
        }
        catch (error) {
            throw new Error(`Failed to get OQA DPPM OVerall  chart: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getAvailableModels() {
        try {
            console.log('🔧 LARReportModel.getAvailableModels called');
            const query = `
        SELECT (model || ' ' || version) as model
        FROM public.inspectiondata
        WHERE model IS NOT NULL AND version IS NOT NULL
        GROUP BY model, version
        ORDER BY model, version
      `;
            const result = await this.db.query(query);
            const models = result.rows.map(row => row.model);
            console.log(`✅ LARReportModel.getAvailableModels: Retrieved ${models.length} models`);
            return models;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getAvailableModels:', error);
            throw new Error(`Failed to get available models: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getFiscalYears() {
        try {
            console.log('🔧 LARReportModel.getFiscalYears called');
            const query = `
        SELECT fy AS fiscal_year
        FROM inspectiondata
        GROUP BY fy
        ORDER BY fy
      `;
            const result = await this.db.query(query);
            const fiscalYears = result.rows.map(row => row.fiscal_year);
            console.log(`✅ LARReportModel.getFiscalYears: Retrieved ${fiscalYears.length} fiscal years`);
            return fiscalYears;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getFiscalYears:', error);
            throw new Error(`Failed to get fiscal years: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    async getWorkWeeks(fiscalYear) {
        try {
            console.log('🔧 LARReportModel.getWorkWeeks called with fiscalYear:', fiscalYear);
            let query = `
        SELECT ww
        FROM inspectiondata
      `;
            const values = [];
            if (fiscalYear) {
                query += ` WHERE fy = $1`;
                values.push(fiscalYear);
            }
            query += `
        GROUP BY ww
        ORDER BY ww
      `;
            const result = await this.db.query(query, values);
            const workWeeks = result.rows.map(row => row.ww);
            console.log(`✅ LARReportModel.getWorkWeeks: Retrieved ${workWeeks.length} work weeks`);
            return workWeeks;
        }
        catch (error) {
            console.error('❌ Error in LARReportModel.getWorkWeeks:', error);
            throw new Error(`Failed to get work weeks: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
}
exports.ReportModel = ReportModel;
function createLARReportModel(db) {
    return new ReportModel(db);
}
exports.default = ReportModel;
