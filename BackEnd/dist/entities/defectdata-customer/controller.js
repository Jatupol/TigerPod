"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DefectDataController = void 0;
exports.createDefectDataController = createDefectDataController;
const generic_controller_1 = require("../../generic/entities/special-entity/generic-controller");
const generic_types_1 = require("../../generic/entities/special-entity/generic-types");
const types_1 = require("./types");
const emailService_1 = require("../../utils/emailService");
class DefectDataController extends generic_controller_1.GenericSpecialController {
    constructor(defectDataService, db) {
        super(defectDataService, types_1.DEFAULT_DEFECTDATA_CONFIG);
        this.emailService = null;
        this.db = null;
        this.getByInspectionNo = async (req, res, next) => {
            try {
                const { inspectionNo } = req.params;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.getByInspectionNo(inspectionNo, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for inspection ${inspectionNo}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getDetailByInspectionNo = async (req, res, next) => {
            try {
                const { inspectionNo } = req.params;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.getDetailByInspectionNo(inspectionNo);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for inspection ${inspectionNo}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getByStationAndDateRange = async (req, res, next) => {
            try {
                const { station } = req.params;
                const { startDate, endDate, limit } = req.query;
                const userId = this.extractUserId(req);
                if (!startDate || !endDate) {
                    const response = {
                        success: false,
                        message: 'Start date and end date are required'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const start = new Date(startDate);
                const end = new Date(endDate);
                const limitNum = limit ? parseInt(limit, 10) : 100;
                if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                    const response = {
                        success: false,
                        message: 'Invalid date format'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.getByStationAndDateRange(station, start, end, limitNum, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for station ${station}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getByInspector = async (req, res, next) => {
            try {
                const { inspector } = req.params;
                const { limit } = req.query;
                const userId = this.extractUserId(req);
                const limitNum = limit ? parseInt(limit, 10) : 100;
                const result = await this.defectDataService.getByInspector(inspector, limitNum, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Found ${result.data?.length || 0} defect records for inspector ${inspector}`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getProfile = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = this.extractUserId(req);
                const idNum = parseInt(id, 10);
                if (isNaN(idNum)) {
                    const response = {
                        success: false,
                        message: 'Invalid defect data ID'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.getProfile(idNum, userId);
                if (!result.success) {
                    const status = result.error?.includes('not found') ? generic_types_1.HTTP_STATUS.NOT_FOUND : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(status).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data profile retrieved successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getSummary = async (req, res, next) => {
            try {
                const { startDate, endDate } = req.query;
                const userId = this.extractUserId(req);
                let start;
                let end;
                if (startDate) {
                    start = new Date(startDate);
                    if (isNaN(start.getTime())) {
                        const response = {
                            success: false,
                            message: 'Invalid start date format'
                        };
                        res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                        return;
                    }
                }
                if (endDate) {
                    end = new Date(endDate);
                    if (isNaN(end.getTime())) {
                        const response = {
                            success: false,
                            message: 'Invalid end date format'
                        };
                        res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                        return;
                    }
                }
                const result = await this.defectDataService.getSummary(start, end, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data summary retrieved successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTrends = async (req, res, next) => {
            try {
                const { days } = req.query;
                const userId = this.extractUserId(req);
                const daysNum = days ? parseInt(days, 10) : 7;
                if (isNaN(daysNum) || daysNum <= 0) {
                    const response = {
                        success: false,
                        message: 'Invalid days parameter'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.getTrends(daysNum, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Defect data trends for ${daysNum} days retrieved successfully`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getInspectorPerformance = async (req, res, next) => {
            try {
                const { inspector } = req.params;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.getInspectorPerformance(inspector, userId);
                if (!result.success) {
                    const status = result.error?.includes('No performance data found') ? generic_types_1.HTTP_STATUS.NOT_FOUND : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(status).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: `Performance data for inspector ${inspector} retrieved successfully`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.createDefectData = async (req, res, next) => {
            try {
                const data = req.body;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.createDefectData(data, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data created successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.CREATED).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.updateDefectData = async (req, res, next) => {
            try {
                const { id } = req.params;
                const data = req.body;
                const userId = this.extractUserId(req);
                const idNum = parseInt(id, 10);
                if (isNaN(idNum)) {
                    const response = {
                        success: false,
                        message: 'Invalid defect data ID'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const result = await this.defectDataService.updateDefectData(idNum, data, userId);
                if (!result.success) {
                    const status = result.error?.includes('not found') ? generic_types_1.HTTP_STATUS.NOT_FOUND : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(status).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data,
                    message: 'Defect data updated successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.searchDefectData = async (req, res, next) => {
            try {
                const searchOptions = req.body;
                const userId = this.extractUserId(req);
                const result = await this.defectDataService.searchDefectData(searchOptions, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data?.data,
                    pagination: result.data?.pagination,
                    message: `Found ${result.data?.pagination.totalCount || 0} defect data records`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.getTodayDefectData = async (req, res, next) => {
            try {
                const { station } = req.query;
                const userId = this.extractUserId(req);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const tomorrow = new Date(today);
                tomorrow.setDate(tomorrow.getDate() + 1);
                const searchOptions = {
                    defect_date_from: today,
                    defect_date_to: tomorrow,
                    station: station || undefined,
                    page: 1,
                    limit: 100,
                    sortBy: 'defect_date',
                    sortOrder: 'DESC'
                };
                const result = await this.defectDataService.searchDefectData(searchOptions, userId);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.error
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    data: result.data?.data,
                    pagination: result.data?.pagination,
                    message: `Found ${result.data?.pagination.totalCount || 0} defect records for today`
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.resendDefectEmail = async (req, res, next) => {
            try {
                const { id } = req.params;
                const userId = this.extractUserId(req);
                const idNum = parseInt(id, 10);
                if (isNaN(idNum)) {
                    const response = {
                        success: false,
                        message: 'Invalid defect data ID'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                console.log(`📧 Resending email for defect ID: ${idNum}`);
                const result = await this.sendDefectEmail(idNum);
                if (!result.success) {
                    const response = {
                        success: false,
                        message: result.message
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const response = {
                    success: true,
                    message: 'Email sent successfully'
                };
                res.status(generic_types_1.HTTP_STATUS.OK).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.deleteDefectData = async (req, res, next) => {
            try {
                const { id } = req.params;
                console.log(`🗑️ Deleting defect data: ${id} `);
                const result = await this.defectDataService.delete(id);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: 'Defect data deleted successfully'
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: 'Failed to delete defect data',
                        error: 'DELETE_FAILED'
                    });
                }
            }
            catch (error) {
                console.error('❌ Error deleting defect data:', error);
                next(error);
            }
        };
        this.bulkCreateDefectData = async (req, res, next) => {
            try {
                const { records } = req.body;
                const userId = this.extractUserId(req);
                if (!Array.isArray(records) || records.length === 0) {
                    const response = {
                        success: false,
                        message: 'Records array is required and cannot be empty'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                if (records.length > 100) {
                    const response = {
                        success: false,
                        message: 'Cannot create more than 100 records at once'
                    };
                    res.status(generic_types_1.HTTP_STATUS.BAD_REQUEST).json(response);
                    return;
                }
                const results = [];
                const errors = [];
                for (let i = 0; i < records.length; i++) {
                    const record = records[i];
                    const result = await this.defectDataService.createDefectData(record, userId);
                    if (result.success && result.data) {
                        results.push(result.data);
                    }
                    else {
                        errors.push(`Record ${i + 1}: ${result.error}`);
                    }
                }
                const response = {
                    success: errors.length === 0,
                    data: results,
                    message: `Successfully created ${results.length} records${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
                    errors: errors.length > 0 ? { bulk: errors } : undefined
                };
                const status = errors.length === 0 ? generic_types_1.HTTP_STATUS.CREATED : generic_types_1.HTTP_STATUS.BAD_REQUEST;
                res.status(status).json(response);
            }
            catch (error) {
                next(error);
            }
        };
        this.defectDataService = defectDataService;
        if (db) {
            this.db = db;
            this.emailService = new emailService_1.EmailService(db);
        }
    }
    async sendDefectEmail(defectId) {
        if (!this.emailService || !this.db) {
            return { success: false, message: 'Email service not configured' };
        }
        try {
            const emailDataResult = await this.defectDataService.getEmailDetailById(defectId);
            if (!emailDataResult.success || !emailDataResult.data || emailDataResult.data.length === 0) {
                console.warn('⚠️ No email detail data found for:', defectId);
                return { success: false, message: 'Email detail data not found' };
            }
            const defectData = emailDataResult.data[0];
            const station = defectData.station || '';
            const inspectionNo = defectData.inspection_no || '';
            const model = defectData.model || '';
            const version = defectData.version || '';
            const shift = defectData.shift || '';
            const itemno = defectData.itemno || '';
            const fvilineno = defectData.fvilineno || '';
            const lotno = defectData.lotno || '';
            const tab = defectData.tab || '';
            const defectName = defectData.defect_name || `Defect #${defectData.defect_id}`;
            const ngQty = defectData.ng_qty;
            const defectDate = new Date(defectData.defect_date);
            const formattedDate = defectDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: '2-digit' });
            const subject = `🚨 ${station} ${defectName} ${model} ${version}_${formattedDate}_Shift ${shift}`;
            const imageDataResult = await this.db.query('SELECT id, imge_data FROM defect_image WHERE defect_id = $1 ORDER BY id', [defectId]);
            const imageAttachments = imageDataResult.rows.map((row, index) => ({
                filename: `defect_${defectId}_image_${index + 1}.jpg`,
                content: row.imge_data,
                cid: `defect_image_${row.id}@qcv`
            }));
            console.log(`📸 Image attachments for defect ${defectId}:`, imageAttachments.length, 'images prepared');
            const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 700px; margin: 0 auto; padding: 20px; }
            .greeting { font-size: 16px; margin-bottom: 20px; }
            .intro { font-size: 14px; margin-bottom: 20px; line-height: 1.8; }
            .details { background: #f8f9fa; padding: 15px; border-left: 4px solid #f97316; margin: 20px 0; }
            .detail-row { margin: 8px 0; }
            .label { font-weight: bold; color: #666; }
            .alert-box { background: #fff3cd; border: 1px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .images { margin: 20px 0; }
            .image-item { display: inline-block; margin: 10px; max-width: 300px; }
            .image-item img { width: 100%; border: 2px solid #ddd; border-radius: 4px; }
            .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="greeting">
              <strong>Dear FVI team and all,</strong>
            </div>

            <div class="intro">
              I would like to share <strong>${station} ${defectName}</strong> on <strong>${model} ${version}</strong>
              found <strong>${ngQty} piece${ngQty > 1 ? 's' : ''}</strong>, please see more details as below.
            </div>

            <div class="details">
              <div class="detail-row"><span class="label">Inspection No:</span> ${inspectionNo}</div>
              <div class="detail-row"><span class="label">Model:</span> ${itemno} ${model} ${version} (line ${fvilineno})</div>
              <div class="detail-row"><span class="label">TGA problematic lot:</span> ${lotno}${tab ? ` (${tab})` : ''}</div>
              <div class="detail-row"><span class="label">Reject Q'ty:</span> <strong>${ngQty} piece${ngQty > 1 ? 's' : ''}</strong></div>
            </div>

            <div class="alert-box">
              <p style="margin: 5px 0;"><strong>⚠️ Action Required:</strong></p>
              <p style="margin: 5px 0;">• Please alert the visual operator to pay attention to this defect.</p>
              <p style="margin: 5px 0;">• Please FVI do the rescreening as the recall protocol then share the result.</p>
            </div>

            ${imageAttachments.length > 0 ? `
              <div class="images">
                <h3 style="color: #f97316;">Reject Sample Images:</h3>
                ${imageAttachments.map(img => `
                  <div class="image-item">
                    <img src="cid:${img.cid}" alt="Defect Sample" style="max-width: 300px; border: 2px solid #ddd; border-radius: 4px;" />
                  </div>
                `).join('')}
              </div>
            ` : ''}

            <div class="footer">
              <p>This is an automated notification from the Quality Control & Verification System.</p>
              <p>Generated at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
        </html>
      `;
            const textContent = `
Dear FVI team and all,

I would like to share ${station} ${defectName} on ${model} ${version} found ${ngQty} piece${ngQty > 1 ? 's' : ''}, please see more details as below.

Inspection No: ${inspectionNo}
Model: ${itemno} ${model} ${version} (line ${fvilineno})
TGA problematic lot: ${lotno}${tab ? ` (${tab})` : ''}
Reject Q'ty: ${ngQty} piece${ngQty > 1 ? 's' : ''}

⚠️ Action Required:
• Please alert the visual operator to pay attention to this defect.
• Please FVI do the rescreening as the recall protocol then share the result.

${imageAttachments.length > 0 ? `\nReject Sample Images: ${imageAttachments.length} image(s) attached` : ''}

---
This is an automated notification from the Quality Control & Verification System.
Generated at ${new Date().toLocaleString()}
      `.trim();
            const sysconfigResult = await this.db.query('SELECT defect_notification_emails FROM sysconfig ORDER BY created_at DESC LIMIT 1');
            let recipientEmails = 'jatupol.sa@gmail.com';
            if (sysconfigResult.rows.length > 0 && sysconfigResult.rows[0].defect_notification_emails) {
                const configuredEmails = sysconfigResult.rows[0].defect_notification_emails.trim();
                if (configuredEmails) {
                    recipientEmails = configuredEmails;
                    console.log(`📧 Sending defect notification to configured recipients: ${recipientEmails}`);
                }
                else {
                    console.log(`📧 No configured emails found, using default: ${recipientEmails}`);
                }
            }
            else {
                console.log(`📧 No sysconfig found, using default recipient: ${recipientEmails}`);
            }
            console.log(`📧 Attempting to send email with ${imageAttachments.length} attachments to: ${recipientEmails}`);
            const emailResult = await this.emailService.sendEmail({
                to: recipientEmails,
                subject: subject,
                text: textContent,
                html: htmlContent,
                attachments: imageAttachments
            });
            console.log(`📧 Email send result - Success: ${emailResult.success}, MessageId: ${emailResult.messageId || 'N/A'}, Error: ${emailResult.error || 'N/A'}`);
            if (!emailResult.success) {
                console.error(`❌ Failed to send defect email: ${emailResult.error}`);
                return { success: false, message: emailResult.error || 'Failed to send email' };
            }
            console.log(`✅ Defect email sent successfully to: ${recipientEmails}`);
            return { success: true, message: 'Email sent successfully' };
        }
        catch (error) {
            console.error('❌ Error sending defect email:', error);
            return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
        }
    }
    extractUserId(req) {
        const user = req.user || req.session?.user;
        return user?.id || 0;
    }
    formatValidationErrors(errors) {
        return {
            validation: errors
        };
    }
    buildQueryOptions(query) {
        const options = {};
        if (query.page)
            options.page = parseInt(query.page, 10);
        if (query.limit)
            options.limit = parseInt(query.limit, 10);
        if (query.sortBy)
            options.sortBy = query.sortBy;
        if (query.sortOrder)
            options.sortOrder = query.sortOrder;
        if (query.search)
            options.search = query.search;
        if (query.inspection_no)
            options.inspection_no = query.inspection_no;
        if (query.station)
            options.station = query.station;
        if (query.linevi)
            options.linevi = query.linevi;
        if (query.inspector)
            options.inspector = query.inspector;
        if (query.defect_id)
            options.defect_id = parseInt(query.defect_id, 10);
        if (query.defect_date_from)
            options.defect_date_from = new Date(query.defect_date_from);
        if (query.defect_date_to)
            options.defect_date_to = new Date(query.defect_date_to);
        if (query.ng_qty_min)
            options.ng_qty_min = parseInt(query.ng_qty_min, 10);
        if (query.ng_qty_max)
            options.ng_qty_max = parseInt(query.ng_qty_max, 10);
        if (query.today === 'true')
            options.today = true;
        if (query.yesterday === 'true')
            options.yesterday = true;
        if (query.this_week === 'true')
            options.this_week = true;
        if (query.this_month === 'true')
            options.this_month = true;
        return options;
    }
}
exports.DefectDataController = DefectDataController;
function createDefectDataController(defectDataService, db) {
    return new DefectDataController(defectDataService, db);
}
exports.default = DefectDataController;
