// client/src/pages/training/T07_IQAPage.tsx
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
 * IQA Data Management Training Page
 *
 * Quick Reference Card #7: การจัดการข้อมูล IQA
 */
const T07_IQAPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={7}
      totalCards={10}
      title="การจัดการข้อมูล IQA"
      subtitle="IQA Data Management Process"
      icon="📊"
      nextLink="/training/t08"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมการจัดการข้อมูล IQA">
        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '16px' }}>
            📋 IQA Data Management คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#0d47a1' }}>
            IQA (In-line Quality Assurance) Data Management เป็นระบบจัดการข้อมูลการตรวจสอบคุณภาพชิ้นงานระหว่างกระบวนการผลิต
            ช่วยในการนำเข้า จัดเก็บ กรองข้อมูล และบันทึก Defect ที่พบในชิ้นงานแต่ละรายการ
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/07_IQA_Overview.png"
            alt="IQA Data Management Overview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการจัดการข้อมูล IQA
          </p>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🎯 ฟีเจอร์หลักของ IQA Data Management:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Import Excel Data:</strong> นำเข้าข้อมูล IQA จากไฟล์ Excel</li>
            <li><strong>Filter by FY/WW:</strong> กรองข้อมูลตาม Fiscal Year และ Work Week</li>
            <li><strong>View Records:</strong> ดูรายการข้อมูล IQA ทั้งหมดพร้อมรายละเอียด</li>
            <li><strong>Add Defect Data:</strong> เพิ่มข้อมูล Defect พร้อมรูปภาพสำหรับแต่ละรายการ IQA</li>
            <li><strong>Export Data:</strong> ส่งออกข้อมูลเป็นไฟล์ Excel</li>
            <li><strong>Delete Records:</strong> ลบรายการที่ไม่ต้องการ (ทีละรายการหรือหลายรายการ)</li>
          </ul>
        </div>
      </Section>

      {/* Section 2: Navigation */}
      <Section title="การเข้าถึงหน้า IQA Data Management">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เข้าสู่ระบบและไปที่หน้า Dashboard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกที่เมนู "Interface" → เลือก "IQA Data"',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ระบบจะแสดงหน้า IQA Data Management พร้อมรายการข้อมูลทั้งหมด',
            },
          ]}
        />
      </Section>

      {/* Section 3: Import Excel Data */}
      <Section title="การนำเข้าข้อมูล IQA จากไฟล์ Excel">
        <Subsection title="📥 ขั้นตอนการ Import ข้อมูล" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📂 การเตรียมไฟล์ Excel:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li>ไฟล์ Excel ต้องมีนามสกุล .xlsx หรือ .xls</li>
            <li>Sheet แรกของไฟล์จะถูกใช้ในการ Import</li>
            <li>คอลัมน์ต้องเรียงตามลำดับที่กำหนด (33 คอลัมน์)</li>
            <li>FY และ WW จะถูกคำนวณอัตโนมัติจาก Date IQA</li>
          </ul>
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            📊 โครงสร้างคอลัมน์ในไฟล์ Excel (ต้องเรียงตามลำดับ):
          </p>
          <div style={{ fontSize: '13px', color: '#4a148c' }}>
            <p style={{ margin: '5px 0' }}><strong>1-7:</strong> FW, Date IQA, Shift, Expense, Re Expense, QC Owner, Model</p>
            <p style={{ margin: '5px 0' }}><strong>8-14:</strong> Item, Telex, Supplier, Description, Location, Qty, Supplier DO</p>
            <p style={{ margin: '5px 0' }}><strong>15-21:</strong> Remark, PO, SBR, Disposition Code, Receipt Date, Age, Warehouse</p>
            <p style={{ margin: '5px 0' }}><strong>22-28:</strong> Building, Business Unit, Std Case Qty, LPN, Lot No, Ref Code, Data on Web</p>
            <p style={{ margin: '5px 0' }}><strong>29-32:</strong> Inspec, Rej, Defect, Vender</p>
          </div>
        </div>

        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'คลิกปุ่ม "Import" (สีม่วง) ที่มุมขวาบนของหน้า',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'เลือกไฟล์ Excel ที่ต้องการ Import จากเครื่องคอมพิวเตอร์',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ระบบจะอ่านไฟล์และแปลงข้อมูล - รอสักครู่ระหว่างการ Import',
            },
            {
              label: 'ขั้นตอนที่ 4',
              description: 'เมื่อสำเร็จ จะแสดงข้อความ "Successfully imported X records"',
            },
            {
              label: 'ขั้นตอนที่ 5',
              description: 'ระบบจะ Reload ข้อมูลและอัปเดตตัวเลือก FY/WW อัตโนมัติ',
            },
          ]}
        />

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            ⚡ การแปลงข้อมูลอัตโนมัติ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>วันที่:</strong> Excel serial dates จะถูกแปลงเป็น YYYY-MM-DD</li>
            <li><strong>ตัวเลข:</strong> Qty, Inspec, Rej, Age, Std Case Qty, LPN จะถูกแปลงเป็น Integer</li>
            <li><strong>FY/WW:</strong> คำนวณจาก Date IQA โดยอัตโนมัติบน Backend</li>
            <li><strong>Null Values:</strong> ค่าว่างจะถูกแปลงเป็น null ในฐานข้อมูล</li>
          </ul>
        </div>
      </Section>

      {/* Section 4: Filtering Data */}
      <Section title="การกรองข้อมูล IQA">
        <Subsection title="🔍 การใช้ FY/WW Filters" />

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            📅 FY (Fiscal Year) Filter:
          </p>
          <StepBox
            steps={[
              {
                label: 'เลือก FY',
                description: 'คลิก dropdown "All FY" และเลือกปีงบประมาณที่ต้องการ (เช่น 2024, 2025)',
              },
              {
                label: 'Auto Filter',
                description: 'เมื่อเลือก FY ระบบจะ: (1) กรองข้อมูลตาม FY (2) อัปเดต WW dropdown ให้แสดงเฉพาะ WW ของ FY นั้น',
              },
              {
                label: 'Visual Indicator',
                description: 'dropdown จะเปลี่ยนเป็นสีเหลืองเมื่อมีการกรอง เพื่อบอกว่า Filter ทำงานอยู่',
              },
            ]}
          />
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            📆 WW (Work Week) Filter:
          </p>
          <StepBox
            steps={[
              {
                label: 'เลือก WW',
                description: 'คลิก dropdown "All WW" และเลือกสัปดาห์ที่ต้องการ (เช่น WW 01, WW 02, ...)',
              },
              {
                label: 'Dependent Filter',
                description: 'หาก FY ถูกเลือกไว้ WW dropdown จะแสดงเฉพาะ WW ของ FY นั้น',
              },
              {
                label: 'Combined Filter',
                description: 'สามารถใช้ทั้ง FY และ WW ร่วมกันเพื่อกรองข้อมูลแบบเฉพาะเจาะจง',
              },
            ]}
          />
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            🔄 Clear Filters:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#7f0000' }}>
            <li>เมื่อมี Filter ใด ๆ ทำงานอยู่ จะมีปุ่ม "Clear Filters" สีแดงปรากฏขึ้น</li>
            <li>คลิกปุ่มนี้เพื่อล้าง Filter ทั้งหมดและแสดงข้อมูลทั้งหมด</li>
            <li>จำนวนรายการจะอัปเดตทันที: "Total Records" และ "Filtered Records"</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            📊 ข้อมูลที่แสดง:
          </p>
          <Table
            headers={['ตัวเลข', 'ความหมาย']}
            rows={[
              ['Total Records', 'จำนวนรายการทั้งหมดในระบบ (ไม่นับ Filter)'],
              ['Filtered Records', 'จำนวนรายการหลังจากใช้ Filter (ถ้าไม่มี Filter จะเท่ากับ Total)'],
              ['Showing X to Y of Z', 'แสดงรายการที่ X ถึง Y จากทั้งหมด Z รายการ (ใช้ Pagination)'],
            ]}
          />
        </div>
      </Section>

      {/* Section 5: View and Manage Records */}
      <Section title="การดูและจัดการรายการ IQA">
        <Subsection title="📋 ตารางข้อมูล IQA Records" />

        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            📊 คอลัมน์ที่แสดงในตาราง (14 คอลัมน์):
          </p>
          <Table
            headers={['คอลัมน์', 'คำอธิบาย', 'สามารถ Sort ได้']}
            rows={[
              ['#', 'หมายเลขลำดับ (ตามหน้า)', '❌'],
              ['FY', 'Fiscal Year (ปีงบประมาณ)', '✅'],
              ['WW', 'Work Week (สัปดาห์)', '✅'],
              ['Date IQA', 'วันที่ตรวจสอบ', '✅'],
              ['Shift', 'Shift to Shift', '✅'],
              ['QC Owner', 'ผู้รับผิดชอบ QC', '✅'],
              ['Model', 'รุ่นผลิตภัณฑ์', '✅'],
              ['Item', 'รายการสินค้า', '✅'],
              ['Supplier', 'ผู้ผลิต', '✅'],
              ['Qty', 'จำนวน', '✅'],
              ['Lot No', 'หมายเลข Lot', '✅'],
              ['Inspec', 'จำนวนที่ตรวจ', '✅'],
              ['Rej', 'จำนวนที่ Reject', '✅'],
              ['Actions', 'ปุ่มจัดการ (Add Defect, Delete)', '❌'],
            ]}
          />
        </div>

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            🔢 การเรียงลำดับข้อมูล (Sorting):
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li><strong>คลิกที่หัวคอลัมน์:</strong> เพื่อเรียงลำดับข้อมูลตามคอลัมน์นั้น</li>
            <li><strong>▲ (Ascending):</strong> เรียงจากน้อยไปมาก (A-Z, 0-9)</li>
            <li><strong>▼ (Descending):</strong> เรียงจากมากไปน้อย (Z-A, 9-0)</li>
            <li><strong>Toggle:</strong> คลิกซ้ำเพื่อสลับระหว่าง ▲ และ ▼</li>
            <li><strong>เปลี่ยนคอลัมน์:</strong> คลิกคอลัมน์อื่นเพื่อเรียงตามคอลัมน์ใหม่ (Default: ▲)</li>
          </ul>
        </div>

        <Subsection title="✅ การเลือกและลบรายการ" />

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            🗑️ การลบรายการ:
          </p>
          <StepBox
            steps={[
              {
                label: 'ลบรายการเดียว',
                description: 'คลิกไอคอน Trash ในคอลัมน์ Actions → ยืนยันการลบ',
              },
              {
                label: 'เลือกหลายรายการ',
                description: 'ติ๊ก Checkbox หน้ารายการที่ต้องการลบ (หรือติ๊ก Checkbox หัวตารางเพื่อเลือกทั้งหน้า)',
              },
              {
                label: 'ลบหลายรายการ',
                description: 'เมื่อเลือกรายการแล้ว ปุ่ม "Delete X" สีแดงจะปรากฏที่มุมขวาบน → คลิกและยืนยันการลบ',
              },
              {
                label: 'Bulk Delete',
                description: 'ระบบจะลบทีละรายการในพื้นหลัง แสดงผลลัพธ์: "Successfully deleted X record(s)"',
              },
            ]}
          />
        </div>

        <Subsection title="📄 Pagination (การแบ่งหน้า)" />

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            📖 การใช้งาน Pagination:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li><strong>Items Per Page:</strong> แสดง 50 รายการต่อหน้า</li>
            <li><strong>Previous/Next:</strong> ใช้ปุ่มลูกศรซ้าย/ขวา เพื่อเลื่อนไปหน้าก่อน/หลัง</li>
            <li><strong>Page Numbers:</strong> คลิกเลขหน้าเพื่อไปยังหน้านั้นโดยตรง</li>
            <li><strong>Auto Scroll:</strong> เมื่อเปลี่ยนหน้าระบบจะ Scroll ขึ้นบนสุดอัตโนมัติ</li>
          </ul>
        </div>
      </Section>

      {/* Section 6: Add Defect Data */}
      <Section title="การเพิ่มข้อมูล Defect สำหรับรายการ IQA">
        <Subsection title="⚠️ เปิด Defect Modal" />

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            🔧 การเข้าถึง Defect Modal:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'ค้นหารายการ IQA ที่ต้องการเพิ่ม Defect ในตาราง',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกไอคอน "⚠️ Exclamation Triangle" (สีส้ม) ในคอลัมน์ Actions',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'Defect Modal จะเปิดขึ้นมา แสดงข้อมูลรายการ IQA และฟอร์มเพิ่ม Defect',
              },
            ]}
          />
        </div>

        <Subsection title="📝 Defect Modal - Split Layout (2 ฝั่ง)" />

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            📋 ฝั่งซ้าย: ฟอร์มเพิ่ม Defect
          </p>
          <div style={{ fontSize: '14px', color: '#4a148c' }}>
            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>1. Record Information (ข้อมูลรายการ IQA):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>แสดงข้อมูลพื้นฐาน: Model, Item, Lot No, Supplier, Qty, Reject</li>
              <li>พื้นหลังสีม่วง เพื่อแสดงว่าเป็นข้อมูลอ้างอิง</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>2. Defect Type Selection *:</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>เลือก Defect Type จาก dropdown</li>
              <li>ระบบจะโหลด Defect Types ที่ Active จากฐานข้อมูล</li>
              <li>แสดงจำนวน Defects ที่โหลดมา</li>
              <li>เมื่อเลือกแล้ว จะแสดง Description ของ Defect Type (ถ้ามี)</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>3. Defect Description (Optional):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>กล่องข้อความ (Textarea) สำหรับอธิบายรายละเอียด Defect</li>
              <li>สามารถพิมพ์ข้อความได้หลายบรรทัด</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>4. Defect Images * (อัปโหลดรูปภาพ):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>คลิกพื้นที่ "Upload Images" เพื่อเลือกรูปภาพจากเครื่อง</li>
              <li>สามารถเลือกหลายรูปพร้อมกัน (Multiple Upload)</li>
              <li>แสดง Preview รูปภาพที่เลือก (Grid 3 คอลัมน์)</li>
              <li>สามารถลบรูปแต่ละรูปโดยคลิกปุ่ม X สีแดงที่มุมรูป</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>5. ปุ่ม "Add Defect" (สีส้ม-แดง Gradient):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>คลิกเพื่อบันทึกข้อมูล Defect</li>
              <li>ปุ่มจะ Disable ถ้า: ไม่มีรูปภาพ หรือ ไม่ได้เลือก Defect Type</li>
              <li>แสดง Loading spinner ขณะกำลังบันทึก</li>
            </ul>
          </div>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            📊 ฝั่งขวา: Previously Saved Defects (ตารางข้อมูล Defect ที่บันทึกไว้แล้ว)
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#01579b' }}>
            <li><strong>Auto Load:</strong> เมื่อเปิด Modal ระบบจะโหลด Defect ที่บันทึกไว้ของรายการ IQA นี้</li>
            <li><strong>ตารางแสดงข้อมูล:</strong> #, Defect ID, Description, Image (Thumbnail)</li>
            <li><strong>คลิกรูปภาพ:</strong> เปิดรูปขนาดเต็มในแท็บใหม่</li>
            <li><strong>Scrollable:</strong> สูงสุด 600px, มี Sticky Header</li>
            <li><strong>Real-time Update:</strong> เมื่อบันทึก Defect ใหม่ ตารางจะอัปเดตทันที</li>
          </ul>
        </div>

        <Subsection title="✅ การบันทึก Defect สำเร็จ" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            🎉 หลังจากบันทึกสำเร็จ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#1b5e20' }}>
            <li>แสดง Success Message สีเขียว: "Successfully uploaded X defect image(s)! You can add more or close this window."</li>
            <li>ฟอร์มจะถูกล้างค่า: Defect Type, Description, Images ทั้งหมด</li>
            <li>ตารางฝั่งขวาจะอัปเดตแสดง Defect ที่เพิ่งบันทึก</li>
            <li>สามารถเพิ่ม Defect เพิ่มเติมได้ทันที โดยไม่ต้องปิด Modal</li>
            <li>Success Message จะหายไปอัตโนมัติหลัง 5 วินาที</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            ⚠️ การ Validate ข้อมูล:
          </p>
          <Table
            headers={['ข้อกำหนด', 'ข้อความแจ้งเตือน']}
            rows={[
              ['ต้องเลือก Defect Type', '"Please select a defect type"'],
              ['ต้องอัปโหลดรูปภาพอย่างน้อย 1 รูป', '"Please upload at least one defect image"'],
              ['Record ต้องมี ID', '"No record selected"'],
            ]}
          />
        </div>
      </Section>

      {/* Section 7: Export Data */}
      <Section title="การส่งออกข้อมูล IQA">
        <Subsection title="📥 Export to Excel" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📊 ขั้นตอนการ Export:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'กรองข้อมูลที่ต้องการ Export ด้วย FY/WW Filters (หรือส่งออกทั้งหมด)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "Export" (สีเขียว) ที่มุมขวาบน',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ระบบจะสร้างไฟล์ Excel และดาวน์โหลดอัตโนมัติ',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ชื่อไฟล์: IQA_Data_YYYY-MM-DD-HH-mm.xlsx (มี Timestamp)',
              },
            ]}
          />
        </div>

        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            📋 ข้อมูลที่ Export:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#0d47a1' }}>
            <li><strong>ข้อมูลที่ส่งออก:</strong> เฉพาะรายการที่ผ่าน Filter (Filtered Records)</li>
            <li><strong>คอลัมน์ทั้งหมด:</strong> 34 คอลัมน์ (รวม #, FY, WW, และข้อมูลทั้งหมด)</li>
            <li><strong>รูปแบบไฟล์:</strong> .xlsx (Excel 2007+)</li>
            <li><strong>Sheet Name:</strong> "IQA Data"</li>
            <li><strong>Header Row:</strong> มีหัวคอลัมน์ภาษาอังกฤษ</li>
          </ul>
        </div>
      </Section>

      {/* Section 8: Troubleshooting */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'Import Excel ไม่สำเร็จ',
              'ตรวจสอบว่าไฟล์เป็น .xlsx/.xls, คอลัมน์ครบ 32 คอลัมน์, ข้อมูลในคอลัมน์ถูกต้อง (วันที่, ตัวเลข)',
            ],
            [
              'FY/WW Filter ไม่แสดงตัวเลือก',
              'ตรวจสอบว่ามีข้อมูล IQA ในระบบ และ Date IQA มีค่าถูกต้อง - ลอง Reload หน้า (F5)',
            ],
            [
              'WW dropdown ว่างเปล่า',
              'เมื่อเลือก FY ระบบจะกรอง WW ตาม FY นั้น - ถ้าไม่มีข้อมูลใน FY นั้น จะแสดงว่าง',
            ],
            [
              'ไม่แสดงรายการ IQA',
              'ตรวจสอบว่า Filter ไม่กรองข้อมูลทั้งหมดออกไป - ลอง Clear Filters',
            ],
            [
              'เปิด Defect Modal ไม่ได้',
              'ตรวจสอบว่ารายการ IQA มี ID - รีเฟรชหน้าและลองใหม่',
            ],
            [
              'ไม่โหลด Defect Types ใน Modal',
              'ตรวจสอบว่ามี Defect Master Data ที่ Active ในระบบ - ติดต่อ Admin',
            ],
            [
              'อัปโหลดรูปภาพใน Modal ไม่ได้',
              'ตรวจสอบว่าไฟล์เป็นรูปภาพ (JPG, PNG, etc.), ขนาดไม่เกิน 5MB - ลองเลือกไฟล์ใหม่',
            ],
            [
              'บันทึก Defect ไม่สำเร็จ',
              'ตรวจสอบว่าเลือก Defect Type และมีรูปภาพอย่างน้อย 1 รูป - ดู Error Message',
            ],
            [
              'ตาราง Saved Defects ว่างเปล่า',
              'หมายความว่ารายการ IQA นี้ยังไม่มี Defect Data - เพิ่ม Defect ใหม่',
            ],
            [
              'Export ไม่ได้',
              'ตรวจสอบว่ามีข้อมูลในรายการ (Filtered Records > 0) - รอให้โหลดข้อมูลเสร็จ',
            ],
            [
              'ลบรายการไม่ได้',
              'ตรวจสอบสิทธิ์ในการลบ - ดู Error Message - ติดต่อ Admin',
            ],
            [
              'Pagination ไม่ทำงาน',
              'รีเฟรชหน้า (F5) - ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
            ],
          ]}
        />
      </Section>

      {/* Section 9: Best Practices */}
      <Section title="แนวทางปฏิบัติที่ดี (Best Practices)">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            ✅ การจัดการข้อมูล IQA อย่างมีประสิทธิภาพ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
            <li><strong>Import ข้อมูลเป็นประจำ:</strong> Import ข้อมูล IQA ตามช่วงเวลาที่กำหนด (เช่น รายสัปดาห์)</li>
            <li><strong>ตรวจสอบข้อมูลก่อน Import:</strong> ตรวจสอบไฟล์ Excel ให้ครบถ้วนและถูกต้องก่อน Import</li>
            <li><strong>ใช้ FY/WW Filters:</strong> กรองข้อมูลเพื่อทำงานกับรายการที่เฉพาะเจาะจง ลดเวลาโหลด</li>
            <li><strong>บันทึก Defect ทันที:</strong> เมื่อพบ Defect ในรายการ IQA ให้บันทึกทันทีพร้อมรูปภาพคุณภาพดี</li>
            <li><strong>Review ข้อมูลที่บันทึก:</strong> ตรวจสอบตาราง Saved Defects ในฝั่งขวาของ Modal</li>
            <li><strong>Export เป็นสำรอง:</strong> Export ข้อมูลเป็นไฟล์ Excel เพื่อเก็บสำรองหรือวิเคราะห์เพิ่มเติม</li>
            <li><strong>ลบข้อมูลที่ไม่ต้องการ:</strong> ทำความสะอาดข้อมูลที่ซ้ำซ้อนหรือผิดพลาดเป็นประจำ</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '16px' }}>
            💡 เคล็ดลับการใช้งาน:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#01579b' }}>
            <li><strong>Sorting:</strong> ใช้ Sorting เพื่อหารายการที่มี Rej สูง หรือจัดกลุ่มตาม Model/Supplier</li>
            <li><strong>Bulk Delete:</strong> เลือกหลายรายการเพื่อลบพร้อมกันประหยัดเวลา</li>
            <li><strong>Multiple Defects:</strong> สามารถเพิ่ม Defect หลายรายการต่อ 1 IQA Record ได้</li>
            <li><strong>Image Quality:</strong> อัปโหลดรูปภาพความละเอียดดี แต่ไม่เกิน 5MB ต่อรูป</li>
            <li><strong>Description:</strong> เขียน Description ที่ชัดเจนเพื่อง่ายต่อการติดตาม</li>
            <li><strong>Pagination:</strong> หากมีข้อมูลมาก ใช้ Filter เพื่อลดจำนวนรายการและเพิ่มความเร็ว</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            🎯 ประโยชน์ของการจัดการข้อมูล IQA:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#5d4037' }}>
            <li><strong>Centralized Data:</strong> รวบรวมข้อมูล IQA ทั้งหมดในที่เดียว ง่ายต่อการค้นหา</li>
            <li><strong>Defect Tracking:</strong> บันทึก Defect พร้อมรูปภาพ ช่วยในการติดตามและแก้ไขปัญหา</li>
            <li><strong>Quality Analysis:</strong> ข้อมูลที่สะอาดและครบถ้วน ช่วยในการวิเคราะห์คุณภาพ</li>
            <li><strong>Reporting:</strong> ส่งออกข้อมูลเพื่อสร้างรายงานและนำเสนอผู้บริหาร</li>
            <li><strong>Traceability:</strong> สืบค้นย้อนกลับไปยังข้อมูลต้นทาง (Lot, Supplier, Date)</li>
            <li><strong>Continuous Improvement:</strong> ใช้ข้อมูลเพื่อปรับปรุงกระบวนการผลิตอย่างต่อเนื่อง</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
        <p style={{ marginTop: '10px' }}>หรือดูคู่มือการใช้งานเพิ่มเติมในเมนู Training</p>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T07_IQAPage;
