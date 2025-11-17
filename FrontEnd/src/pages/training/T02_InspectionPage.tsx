// client/src/pages/training/T02_InspectionPage.tsx
import React from 'react';
import TrainingLayout from '../../components/training/TrainingLayout';
import {
  Section,
  StepBox,
  Table,
  HelpBox,
  Subsection,
  List,
} from '../../components/training/TrainingComponents';

/**
 * OQA Inspection Training Page
 *
 * Quick Reference Card #2: การตรวจสอบ OQA
 */
const T02_InspectionPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={2}
      totalCards={10}
      title="การตรวจสอบ OQA"
      subtitle="OQA Inspection Recording"
      icon="🔍"
      nextLink="/training/t03"
    >
      {/* Section 1: OQA Inspection Overview */}
      <Section title="ภาพรวมการตรวจสอบ OQA (Outgoing Quality Assurance)">
        <div style={{ background: '#fff8e1', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffd54f' }}>
          <p style={{ margin: '0', fontWeight: 'bold', color: '#f57c00', fontSize: '16px' }}>
            🎯 OQA คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#5d4037' }}>
            OQA (Outgoing Quality Assurance) คือการตรวจสอบคุณภาพขั้นสุดท้ายก่อนส่งชิ้นงานไปยังขั้นตอนถัดไป
            เพื่อให้มั่นใจว่าสินค้าตรงตามมาตรฐานคุณภาพที่กำหนดไว้
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/02_OQA_Overview.png"
            alt="OQA Inspection Overview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการตรวจสอบ OQA Inspection
          </p>
        </div>
      </Section>

      {/* Section 2.5: Document Number & WW Calculation */}
      <Section title="การทำความเข้าใจ Inspection Number, WW และ Round Number">

        {/* Inspection Number Format */}
        <Subsection title="📋 รูปแบบ Inspection Number" />
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #90caf9', marginBottom: '15px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            รูปแบบของ Inspection Number:
          </p>
          <div style={{
            background: '#f5f5f5',
            padding: '12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#d32f2f',
            textAlign: 'center',
            marginBottom: '10px'
          }}>
            OQA + YYMMWW + - + DD + XXXX
          </div>
          <Table
            headers={['ส่วนประกอบ', 'ความหมาย', 'ตัวอย่าง']}
            rows={[
              [
                'OQA',
                'รหัสสถานี (Station Code)',
                'OQA, OBA, SIV',
              ],
              [
                'YY',
                'ปี คศ. ที่ทำการตรวจสอบ (Inspection year)\nYY = ปี',
                '2025 ',
              ],
              [
                'MM',
                'MM = เดือน (Month)',
                '01 ถึง 12',
              ],
              [
                'WW',
                'เลขสัปดาห์ในปีงบประมาณ (Fiscal Week)',
                '01 ถึง 53',
              ],
              [
                'DD',
                'วันที่ในเดือน (DAY of Month)',
                '01 ถึง 31',
              ],
              [
                'XXXX',
                'หมายเลขลำดับอัตโนมัติ (Sequential Number)',
                '0001, 0002, ...',
              ],
            ]}
          />

          <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#2e7d32' }}>
              💡 <strong>ตัวอย่าง:</strong> <code style={{ background: '#fff', padding: '4px 8px', borderRadius: '4px', color: '#c62828' }}>OQA250311-151234</code>
            </p>
            <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', fontSize: '13px', color: '#1b5e20' }}>
              <li><strong>OQA</strong> = สถานี OQA Inspection</li>
              <li><strong>250311</strong> = สัปดาห์ที่ 11 ของปีงบประมาณ เดือน มีนาคม 2568</li>
              <li><strong>15</strong> = วันที่ 15 มีนาคม 2568</li>
              <li><strong>1234</strong> = หมายเลขลำดับอัตโนมัติ</li>
            </ul>
          </div>
        </div>

        {/* WW Calculation */}
        <Subsection title="📅 การคำนวณ WW (Fiscal Week Number)" />
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #ffb74d', marginBottom: '15px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            วิธีการคำนวณ WW (Work Week / Fiscal Week):
          </p>

          <div style={{ background: '#fffde7', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #fdd835' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#f57c00' }}>
              🗓️ หลักการคำนวณ:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
              <li><strong>วันเริ่มต้นสัปดาห์:</strong> วันเสาร์ (Saturday) ของทุกสัปดาห์</li>
              <li><strong>วันเริ่มต้นปีงบประมาณ:</strong> วันเสาร์แรกของเดือนกรกฎาคม</li>
              <li><strong>การนับสัปดาห์:</strong> นับจากวันเสาร์แรกของปีเป็น WW01</li>
              <li><strong>ระบบจะคำนวณอัตโนมัติ</strong> เมื่อเลือก Sampling Date</li>
            </ul>
          </div>

          <Table
            headers={['ช่วงวันที่', 'WW', 'Fiscal Year']}
            rows={[
              [
                '28 มิ.ย 68 - 4 ก.ค. 68',
                'WW01',
                'FY 2025',
              ],
              [
                '5 ก.ค. 68 - 11 ก.ค. 68',
                'WW02',
                'FY 2025',
              ],
              [
                '27 ธ.ค. 68 - 2 ม.ค. 69',
                'WW27',
                'FY 2025',
              ],
              [
                '...',
                '...',
                '...',
              ],
              [
                '20 มิ.ย 69 - 20 มิ.ย 69',
                'WW52',
                'FY 2025',
              ],
            ]}
          />

          <div style={{ background: '#e1f5fe', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#01579b' }}>
              ℹ️ <strong>หมายเหตุ:</strong> ค่า WW และ Fiscal Year จะถูกคำนวณและแสดงโดยอัตโนมัติเมื่อคุณเลือก Sampling Date
              ไม่จำเป็นต้องกรอกด้วยตนเอง
            </p>
          </div>

          <div style={{ background: '#ffebee', padding: '12px', borderRadius: '6px', marginTop: '12px', border: '1px solid #ef5350' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#c62828' }}>
              ⚠️ <strong>ข้อควรระวัง:</strong> หากต้องการแก้ไข WW ให้แก้ไขที่ Sampling Date แทน
              เพราะระบบจะคำนวณ WW ใหม่อัตโนมัติจากวันที่ที่เลือก
            </p>
          </div>
        </div>

        {/* Round Number */}
        <Subsection title="🔄 Round Number (รอบการตรวจสอบ)" />
        <div style={{ background: '#fff', padding: '15px', borderRadius: '8px', border: '1px solid #4caf50', marginBottom: '15px' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            การคำนวณ Round Number (Sampling Round):
          </p>

          <div style={{ background: '#e8f5e9', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #81c784' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#2e7d32' }}>
              🔢 หลักการคำนวณ:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
              <li><strong>Round Number</strong> คือ จำนวนครั้งที่ Lot นี้ถูกตรวจสอบในสถานีนี้</li>
              <li><strong>คำนวณอัตโนมัติ:</strong> ระบบนับจากจำนวนครั้งที่ Lot Number ถูกตรวจสอบในสถานีเดียวกันแล้ว</li>
              <li><strong>Round 1</strong> = ครั้งแรกที่ตรวจสอบ Lot นี้ในสถานีนี้</li>
              <li><strong>Round 2</strong> = ครั้งที่สองที่ตรวจสอบ Lot เดียวกันในสถานีนี้</li>
              <li><strong>Round 3+</strong> = ครั้งที่สามและต่อๆไป สำหรับ Lot ที่ต้องตรวจสอบซ้ำหลายครั้ง</li>
            </ul>
          </div>

          <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #ffb74d' }}>
            <p style={{ margin: '0 0 8px 0', fontWeight: 'bold', color: '#e65100' }}>
              📝 ตัวอย่างการคำนวณ Round:
            </p>
            <Table
              headers={['สถานการณ์', 'Station', 'Lot Number', 'Round', 'คำอธิบาย']}
              rows={[
                [
                  'ครั้งที่ 1',
                  'OQA',
                  'LOT12345',
                  '1',
                  'ตรวจสอบ Lot นี้ครั้งแรกในสถานี OQA',
                ],
                [
                  'ครั้งที่ 2',
                  'OQA',
                  'LOT12345',
                  '2',
                  'ตรวจสอบ Lot เดียวกันอีกครั้งในสถานี OQA (Reject แล้วส่ง Rework)',
                ],
                [
                  'ครั้งที่ 3',
                  'SIV',
                  'LOT12345',
                  '1',
                  'ตรวจสอบ Lot เดียวกันในสถานี SIV (Round เริ่มใหม่เพราะเป็นคนละสถานี)',
                ],
                [
                  'ครั้งที่ 4',
                  'OQA',
                  'LOT67890',
                  '1',
                  'ตรวจสอบ Lot ใหม่ในสถานี OQA (Round เริ่มใหม่เพราะเป็น Lot ใหม่)',
                ],
              ]}
            />
          </div>

          <div style={{ background: '#e1f5fe', padding: '12px', borderRadius: '6px', marginTop: '12px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#01579b' }}>
              ℹ️ <strong>หมายเหตุ:</strong> Round Number จะถูกคำนวณและแสดงอัตโนมัติเมื่อคุณเลือก Lot Number ในขั้นตอนที่ 2
              ระบบจะตรวจสอบประวัติการตรวจสอบของ Lot นั้นในสถานีที่เลือกและกำหนด Round ที่เหมาะสม
            </p>
          </div>

          <div style={{ background: '#fff9c4', padding: '12px', borderRadius: '6px', marginTop: '12px', border: '1px solid #fdd835' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#f57f17' }}>
              💡 <strong>เคล็ดลับ:</strong> Round Number จะแสดงในหน้าจอการตรวจสอบหลังจากเลือก Lot แล้ว
              ตัวอย่าง: "Sampling Round: 1", "Sampling Round: 2" เป็นต้น
            </p>
          </div>
        </div>
      </Section>
 

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T02_InspectionPage;
