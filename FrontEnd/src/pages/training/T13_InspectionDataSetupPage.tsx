// client/src/pages/training/T13_InspectionDataSetupPage.tsx
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
 * Inspection Data Setup Configuration Training Page
 *
 * Quick Reference Card #13: การตั้งค่าข้อมูลการตรวจสอบ
 */
const T13_InspectionDataSetupPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={13}
      totalCards={10}
      title="การตั้งค่าข้อมูลการตรวจสอบ"
      subtitle="Inspection Data Setup Configuration"
      icon="⚙️"
      nextLink="/training"
    >
      {/* Section 1: Overview */}
      <Section title="ภาพรวมการตั้งค่าข้อมูลการตรวจสอบ">
        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            📋 Inspection Data Setup คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#5d4037' }}>
            Inspection Data Setup เป็นหน้าสำหรับตั้งค่าพารามิเตอร์ต่าง ๆ ที่ใช้ในกระบวนการตรวจสอบคุณภาพ
            รวมถึงจำนวนการสุ่มตัวอย่าง, ข้อมูลองค์กร (Site, Shift, Product), และการตั้งค่า Defects
            <strong> หน้านี้ไม่ใช่การจัดการ Master Data แบบทั่วไป แต่เป็นการแก้ไขค่า Configuration เดียว</strong>
          </p>
        </div>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/13_InspectionSetup_Overview.png"
            alt="Inspection Data Setup Overview"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้าจอการตั้งค่าข้อมูลการตรวจสอบ (3 คอลัมน์)
          </p>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            🎯 ความแตกต่างจาก Master Data Pages อื่น:
          </p>
          <Table
            headers={['Master Data Pages (ปกติ)', 'Inspection Setup (พิเศษ)']}
            rows={[
              ['CREATE: เพิ่มรายการใหม่ได้', 'ไม่มี CREATE - แก้ไข Config เดียวเท่านั้น'],
              ['READ: ดูรายการทั้งหมด', 'READ: โหลด Active Configuration เดียว'],
              ['UPDATE: แก้ไขรายการที่เลือก', 'UPDATE: แก้ไข Configuration ปัจจุบัน'],
              ['DELETE: ลบรายการได้', 'ไม่มี DELETE - เก็บ Config ไว้เสมอ'],
              ['มีตาราง (Table)', 'ไม่มีตาราง - แสดงฟอร์มเดียว'],
              ['มี Pagination', 'ไม่มี Pagination'],
            ]}
          />
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            🏗️ โครงสร้างหน้า (3 คอลัมน์):
          </p>
          <div style={{ fontSize: '14px', color: '#4a148c', lineHeight: '1.8' }}>
            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>คอลัมน์ 1: Sampling Quantities (สีส้ม):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>FVI Lot Quantity (จำนวน Lot สำหรับ FVI)</li>
              <li>General OQA Quantity (จำนวนสุ่มตัวอย่าง OQA ทั่วไป)</li>
              <li>Crack OQA Quantity (จำนวนสุ่มตัวอย่าง OQA สำหรับ Crack)</li>
              <li>General SIV Quantity (จำนวนสุ่มตัวอย่าง SIV ทั่วไป)</li>
              <li>Crack SIV Quantity (จำนวนสุ่มตัวอย่าง SIV สำหรับ Crack)</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>คอลัมน์ 2: Organization Data (สีน้ำเงิน):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Shift (กะการทำงาน: A, B, C, Day, Night)</li>
              <li>Site (สถานที่/โรงงาน: TNHK, JNHK, etc.)</li>
              <li>Tabs (แท็บ/หมวดหมู่: 1, 2, 3)</li>
              <li>Product Type (ประเภทสินค้า: SSA, DSA)</li>
              <li>Product Families (กลุ่มผลิตภัณฑ์: Iris, Pine)</li>
            </ul>

            <p style={{ margin: '10px 0', fontWeight: 'bold' }}>คอลัมน์ 3: Defect Configuration (สีแดง):</p>
            <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
              <li>Defect Type (ประเภท Defect: Normal defect)</li>
              <li>Defect Group (กลุ่ม Defect: Cosmetic, Functional)</li>
              <li>Defect Color (สี Defect: Red, Yellow)</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* Section 2: Navigation */}
      <Section title="การเข้าถึงหน้า Inspection Data Setup">
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เข้าสู่ระบบและไปที่หน้า Dashboard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกที่เมนู "Master Data" → เลือก "Inspection Data Setup"',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'ระบบจะโหลด Active Configuration และแสดงค่าปัจจุบันทั้งหมด',
            },
          ]}
        />

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            ⚠️ ถ้าไม่มี Active Configuration:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#5d4037' }}>
            <li>จะแสดงหน้า Error: "Configuration Not Found"</li>
            <li>แสดงข้อความ: "Failed to load configuration. Please check if there is an active system configuration."</li>
            <li>มีปุ่ม "Retry" เพื่อลองโหลดใหม่</li>
            <li>ต้องไปสร้าง Active Configuration ใน System Configuration ก่อน</li>
          </ul>
        </div>
      </Section>

      {/* Section 3: ArrayValueManager Component */}
      <Section title="การใช้งาน Array Value Manager (คอมโพเนนต์หลัก)">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            🧩 Array Value Manager คืออะไร?
          </p>
          <p style={{ margin: '10px 0 0 0', color: '#1b5e20' }}>
            Array Value Manager เป็นคอมโพเนนต์พิเศษสำหรับจัดการค่าหลายค่า (Array) ในแต่ละฟิลด์
            แต่ละฟิลด์จะเก็บข้อมูลเป็น Comma-Separated Values (CSV) เช่น "A,B,C,Day,Night"
            คอมโพเนนต์นี้ช่วยให้เพิ่ม/ลบค่าได้ง่าย โดยไม่ต้องพิมพ์ comma เอง
          </p>
        </div>

        <Subsection title="➕ การเพิ่มค่า (Add Value)" />

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            📝 ขั้นตอนการเพิ่มค่า:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'คลิกปุ่ม "Edit Configuration" ที่มุมขวาบน (เข้าสู่ Edit Mode)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'เลือกฟิลด์ที่ต้องการเพิ่มค่า (เช่น Shift)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'พิมพ์ค่าในช่อง Input (เช่น "Day" สำหรับ Shift)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'คลิกปุ่ม + (สีส้ม) หรือกด Enter',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ค่าจะถูกเพิ่มเข้าไปในรายการด้านล่าง (แสดงเป็น Badge สีขาว)',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'ช่อง Input จะถูกล้างอัตโนมัติ พร้อมเพิ่มค่าถัดไป',
              },
            ]}
          />
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            ⚡ Validation Rules เมื่อเพิ่มค่า:
          </p>
          <Table
            headers={['กฎ', 'คำอธิบาย', 'ตัวอย่าง']}
            rows={[
              ['ไม่ว่างเปล่า', 'ไม่สามารถเพิ่มค่าว่างได้', 'พิมพ์ "   " → ไม่สามารถเพิ่มได้'],
              ['Numeric (ถ้าเป็นตัวเลข)', 'ต้องเป็นตัวเลขที่ valid', 'FVI Lot Qty: "abc" → ไม่สามารถเพิ่มได้'],
              ['ไม่ซ้ำ', 'ไม่สามารถเพิ่มค่าซ้ำได้', 'มี "A" อยู่แล้ว → พิมพ์ "A" อีก → ไม่สามารถเพิ่มได้'],
              ['Max Items', 'จำนวนสูงสุดตามที่กำหนด', 'Shift: max 10 items, Site: max 15 items'],
            ]}
          />
        </div>

        <Subsection title="❌ การลบค่า (Remove Value)" />

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            🗑️ ขั้นตอนการลบค่า:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'อยู่ใน Edit Mode (คลิก "Edit Configuration" ถ้ายังไม่ได้เข้า)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'มองหาค่าที่ต้องการลบในรายการด้านล่าง (แสดงเป็น Badge)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'คลิกไอคอน X (สีแดง) ทางขวาของค่านั้น',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ค่าจะถูกลบออกจากรายการทันที',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'จำนวน items จะอัปเดต (เช่น "4 / 10 items" → "3 / 10 items")',
              },
            ]}
          />
        </div>

        <div style={{ background: '#f3e5f5', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ba68c8' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#6a1b9a', fontSize: '15px' }}>
            💡 คุณสมบัติของ Array Value Manager:
          </p>
          <Table
            headers={['ฟีเจอร์', 'คำอธิบาย']}
            rows={[
              ['Keyboard Shortcut', 'กด Enter เพื่อเพิ่มค่า (ไม่ต้องคลิก +)'],
              ['Visual Feedback', 'แสดง Badge พร้อมสีพื้นหลัง (orange gradient)'],
              ['Item Counter', 'แสดงจำนวน "X / Y items" (เช่น "5 / 10 items")'],
              ['Disabled State', 'ปุ่ม + จะ disable เมื่อ: (1) ไม่ได้อยู่ใน Edit Mode (2) Input ว่าง (3) ครบ Max Items'],
              ['Type Safety', 'Numeric fields จะบล็อกตัวอักษร (ใช้ <input type="number">)'],
              ['Hover Effect', 'Badge จะมี hover effect (shadow-md) เมื่อเมาส์วางบน'],
            ]}
          />
        </div>
      </Section>

      {/* Section 4: Edit Configuration */}
      <Section title="การแก้ไข Configuration (UPDATE)">
        <Subsection title="✏️ เข้าสู่ Edit Mode" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            📝 ขั้นตอนการแก้ไข Configuration:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'โหลดหน้า Inspection Data Setup (จะแสดงค่าปัจจุบันทั้งหมด)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "Edit Configuration" สีส้มที่มุมขวาบน',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ระบบเข้าสู่ Edit Mode: ปุ่ม "Edit Configuration" จะหายไป, Array Value Managers จะ enable',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'แก้ไขค่าตามต้องการ: เพิ่ม/ลบค่าในฟิลด์ต่าง ๆ (ใช้ Array Value Manager)',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ระบบจะติดตาม Changes (มีการเปลี่ยนแปลงหรือไม่)',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'เมื่อเสร็จสิ้น: คลิกปุ่ม "Save Changes" หรือ "Cancel"',
              },
            ]}
          />
        </div>

        <Subsection title="💾 การบันทึกการเปลี่ยนแปลง (Save Changes)" />

        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '15px' }}>
            ✅ ขั้นตอนการ Save:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'แก้ไขค่าในฟิลด์ต่าง ๆ (ระบบจะติดตามการเปลี่ยนแปลง)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'มองหาปุ่ม "Save Changes" ที่ด้านล่าง (Action Buttons Section)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ถ้าไม่มีการเปลี่ยนแปลง: ปุ่ม "Save Changes" จะ disable (opacity: 50%)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ถ้ามีการเปลี่ยนแปลง: คลิกปุ่ม "Save Changes" สีส้ม',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ปุ่มจะแสดง "Saving..." พร้อมไอคอน Loading (animate-spin)',
              },
              {
                label: 'ขั้นตอนที่ 6',
                description: 'ระบบจะส่งเฉพาะฟิลด์ที่เปลี่ยนแปลง (Changed Fields Only) ไปยัง API',
              },
              {
                label: 'ขั้นตอนที่ 7',
                description: 'หากสำเร็จ: แสดง Success Message สีเขียว "Configuration updated successfully!"',
              },
              {
                label: 'ขั้นตอนที่ 8',
                description: 'ระบบจะ Reload Configuration และออกจาก Edit Mode อัตโนมัติ',
              },
              {
                label: 'ขั้นตอนที่ 9',
                description: 'Success Message จะหายไปเองหลัง 3 วินาที',
              },
            ]}
          />
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '15px' }}>
            ⚙️ การทำงานของ Save (Backend):
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#01579b' }}>
            <li><strong>Changed Fields Only:</strong> ส่งเฉพาะฟิลด์ที่เปลี่ยนแปลง ประหยัด bandwidth</li>
            <li><strong>PUT Request:</strong> ใช้ PUT /api/sysconfig/:id</li>
            <li><strong>No Changes Check:</strong> ถ้าไม่มีการเปลี่ยนแปลง แสดง "No changes to save" (ไม่เรียก API)</li>
            <li><strong>Validation:</strong> Backend จะ validate ค่าทั้งหมดก่อนบันทึก</li>
            <li><strong>Response:</strong> API จะส่ง Updated Configuration กลับมา</li>
          </ul>
        </div>

        <Subsection title="❌ การยกเลิกการแก้ไข (Cancel)" />

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            🔄 ขั้นตอนการ Cancel:
          </p>
          <StepBox
            steps={[
              {
                label: 'ขั้นตอนที่ 1',
                description: 'อยู่ใน Edit Mode (กำลังแก้ไขค่า)',
              },
              {
                label: 'ขั้นตอนที่ 2',
                description: 'คลิกปุ่ม "Cancel" สีเทา (ทางซ้ายของปุ่ม Save)',
              },
              {
                label: 'ขั้นตอนที่ 3',
                description: 'ระบบจะ Restore ค่าเดิมทั้งหมด (ก่อนเข้า Edit Mode)',
              },
              {
                label: 'ขั้นตอนที่ 4',
                description: 'ออกจาก Edit Mode อัตโนมัติ',
              },
              {
                label: 'ขั้นตอนที่ 5',
                description: 'ปุ่ม "Edit Configuration" จะปรากฏขึ้นมาอีกครั้ง',
              },
            ]}
          />
        </div>
      </Section>

      {/* Section 5: Field Details */}
      <Section title="รายละเอียดฟิลด์ทั้งหมด (13 ฟิลด์)">
        <Subsection title="🔢 Column 1: Sampling Quantities (ตัวเลขเท่านั้น)" />

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '15px' }}>
            📊 ฟิลด์จำนวนการสุ่มตัวอย่าง (5 ฟิลด์):
          </p>
          <Table
            headers={['ฟิลด์', 'คำอธิบาย', 'Type', 'Max Items', 'ตัวอย่าง']}
            rows={[
              ['FVI Lot Quantity', 'จำนวน Lot สำหรับ FVI', 'Numeric', '10', '2400, 1200, 600'],
              ['General OQA Quantity', 'จำนวนสุ่มตัวอย่าง OQA ทั่วไป', 'Numeric', '10', '78, 32, 13'],
              ['Crack OQA Quantity', 'จำนวนสุ่มตัวอย่าง OQA สำหรับ Crack', 'Numeric', '10', '80, 50, 20'],
              ['General SIV Quantity', 'จำนวนสุ่มตัวอย่าง SIV ทั่วไป', 'Numeric', '10', '32, 13, 5'],
              ['Crack SIV Quantity', 'จำนวนสุ่มตัวอย่าง SIV สำหรับ Crack', 'Numeric', '10', '60, 50, 13'],
            ]}
          />
        </div>

        <Subsection title="🏢 Column 2: Organization Data (ข้อความ)" />

        <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #90caf9' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#1565c0', fontSize: '15px' }}>
            🏭 ฟิลด์ข้อมูลองค์กร (5 ฟิลด์):
          </p>
          <Table
            headers={['ฟิลด์', 'คำอธิบาย', 'Type', 'Max Items', 'ตัวอย่าง']}
            rows={[
              ['Shift', 'กะการทำงาน', 'Text', '10', 'A, B, C, Day, Night'],
              ['Site', 'สถานที่/โรงงาน', 'Text', '15', 'TNHK, JNHK, BKK'],
              ['Tabs', 'แท็บ/หมวดหมู่', 'Text', '10', '1, 2, 3, ALL'],
              ['Product Type', 'ประเภทสินค้า', 'Text', '15', 'SSA, DSA, HSA'],
              ['Product Families', 'กลุ่มผลิตภัณฑ์', 'Text', '15', 'Iris, Pine, Oak'],
            ]}
          />
        </div>

        <Subsection title="⚠️ Column 3: Defect Configuration (ข้อความ)" />

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            🔴 ฟิลด์การตั้งค่า Defect (3 ฟิลด์):
          </p>
          <Table
            headers={['ฟิลด์', 'คำอธิบาย', 'Type', 'Max Items', 'ตัวอย่าง']}
            rows={[
              ['Defect Type', 'ประเภท Defect', 'Text', '20', 'Normal defect, Critical defect'],
              ['Defect Group', 'กลุ่ม Defect', 'Text', '20', 'Cosmetic, Functional, Dimensional'],
              ['Defect Color', 'สี Defect (สำหรับจำแนก)', 'Text', '20', 'Red, Yellow, Green, Blue'],
            ]}
          />
        </div>
      </Section>

      {/* Section 6: States & Messages */}
      <Section title="สถานะและข้อความของระบบ">
        <Subsection title="🔄 Loading States" />

        <div style={{ background: '#e8eaf6', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #9fa8da' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#283593', fontSize: '15px' }}>
            ⏳ สถานะต่าง ๆ ของหน้า:
          </p>
          <Table
            headers={['State', 'คำอธิบาย', 'การแสดงผล']}
            rows={[
              ['Loading', 'กำลังโหลด Configuration', 'แสดง Loading Spinner พร้อมข้อความ "Loading inspection configuration..."'],
              ['Error (No Config)', 'ไม่มี Active Configuration', 'แสดงหน้า Error พร้อมไอคอนสามเหลี่ยมสีแดง และปุ่ม "Retry"'],
              ['View Mode', 'ดูค่าปัจจุบัน (ไม่ได้แก้ไข)', 'แสดงค่าทั้งหมด, มีปุ่ม "Edit Configuration", Array Managers disabled'],
              ['Edit Mode', 'กำลังแก้ไขค่า', 'ไม่มีปุ่ม "Edit Configuration", Array Managers enabled, มี Action Buttons (Cancel/Save)'],
              ['Saving', 'กำลังบันทึกการเปลี่ยนแปลง', 'ปุ่ม "Save Changes" แสดง "Saving..." พร้อม Loading Spinner'],
            ]}
          />
        </div>

        <Subsection title="💬 Success & Error Messages" />

        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '15px' }}>
            ✅ Success Messages (สีเขียว):
          </p>
          <Table
            headers={['Message', 'เมื่อไหร่', 'Duration']}
            rows={[
              ['"Configuration updated successfully!"', 'บันทึกสำเร็จ', 'หายไปหลัง 3 วินาที'],
              ['"No changes to save"', 'คลิก Save แต่ไม่มีการเปลี่ยนแปลง', 'หายไปหลัง 3 วินาที'],
            ]}
          />
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #ef9a9a' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '15px' }}>
            ❌ Error Messages (สีแดง):
          </p>
          <Table
            headers={['Message', 'เมื่อไหร่', 'การแก้ไข']}
            rows={[
              ['Failed to load configuration...', 'โหลด Config ไม่สำเร็จ', 'คลิก Retry หรือตรวจสอบ Active Config'],
              ['No configuration ID found', 'ไม่มี ID ของ Config', 'Reload หน้า หรือตรวจสอบ Database'],
              ['Failed to save configuration', 'บันทึกไม่สำเร็จ', 'ตรวจสอบ Network, Validation, หรือ Server logs'],
            ]}
          />
        </div>
      </Section>

      {/* Section 7: Use Cases */}
      <Section title="กรณีการใช้งาน (Use Cases)">
        <div style={{ background: '#fff9c4', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #fdd835' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#f57f17', fontSize: '16px' }}>
            🎯 Use Cases ที่พบบ่อย:
          </p>
          <Table
            headers={['สถานการณ์', 'การดำเนินการ', 'ฟิลด์ที่แก้ไข']}
            rows={[
              [
                'เพิ่มกะใหม่ (Shift C)',
                'Edit → Shift → พิมพ์ "C" → คลิก + → Save',
                'Shift'
              ],
              [
                'เพิ่มโรงงานใหม่',
                'Edit → Site → พิมพ์ "CBHK" → คลิก + → Save',
                'Site'
              ],
              [
                'เปลี่ยนจำนวนสุ่มตัวอย่าง',
                'Edit → General OQA Quantity → ลบค่าเก่า (X) → เพิ่มค่าใหม่ (+) → Save',
                'General OQA Quantity'
              ],
              [
                'เพิ่มประเภทสินค้าใหม่',
                'Edit → Product Type → พิมพ์ "MSA" → คลิก + → Save',
                'Product Type'
              ],
              [
                'เพิ่ม Defect Group',
                'Edit → Defect Group → พิมพ์ "Assembly" → คลิก + → Save',
                'Defect Group'
              ],
              [
                'ลบค่าที่ไม่ใช้แล้ว',
                'Edit → เลือกฟิลด์ → คลิก X ที่ค่านั้น → Save',
                'Any Field'
              ],
              [
                'อัปเดตหลายฟิลด์',
                'Edit → แก้ไขหลายฟิลด์ (Add/Remove values) → Save',
                'Multiple Fields'
              ],
            ]}
          />
        </div>
      </Section>

      {/* Section 8: Troubleshooting */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'หน้าแสดง "Configuration Not Found"',
              'ตรวจสอบว่ามี Active Configuration ในระบบ - ไปที่ System Configuration และ set is_active = true',
            ],
            [
              'ไม่สามารถเพิ่มค่าได้',
              'ตรวจสอบ: (1) อยู่ใน Edit Mode หรือไม่ (2) ค่าว่างหรือไม่ (3) ซ้ำหรือไม่ (4) ครบ Max Items แล้วหรือไม่',
            ],
            [
              'ปุ่ม Save ถูก Disable',
              'หมายความว่าไม่มีการเปลี่ยนแปลงใด ๆ - ต้องเพิ่ม/ลบค่าอย่างน้อย 1 ค่า',
            ],
            [
              'Numeric Field ไม่ยอมรับตัวอักษร',
              'นี่คือพฤติกรรมที่ถูกต้อง - ฟิลด์ตัวเลขต้องเป็นตัวเลขเท่านั้น',
            ],
            [
              'ค่าหายไปหลัง Cancel',
              'นี่คือพฤติกรรมที่ถูกต้อง - Cancel จะ Restore ค่าเดิมทั้งหมด',
            ],
            [
              'Save ไม่สำเร็จ',
              'ตรวจสอบ: (1) Network connection (2) Server logs (3) Validation errors (4) Database connection',
            ],
            [
              'Success Message ไม่หาย',
              'รอ 3 วินาที จะหายเอง หรือรีเฟรชหน้า',
            ],
            [
              'Array Value Manager ไม่ทำงาน',
              'ตรวจสอบว่าอยู่ใน Edit Mode - คลิก "Edit Configuration" ก่อน',
            ],
            [
              'กด Enter แล้วไม่เพิ่มค่า',
              'ตรวจสอบว่า Input มีค่าและ valid (ไม่ว่าง, ไม่ซ้ำ, ไม่ครบ Max)',
            ],
            [
              'ไม่เห็นปุ่ม Edit Configuration',
              'อาจอยู่ใน Edit Mode อยู่แล้ว - มองหาปุ่ม Cancel/Save ด้านล่าง',
            ],
          ]}
        />
      </Section>

      {/* Section 9: Best Practices */}
      <Section title="แนวทางปฏิบัติที่ดี (Best Practices)">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            ✅ แนวทางการใช้งานอย่างมีประสิทธิภาพ:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
            <li><strong>Plan Before Edit:</strong> วางแผนก่อนว่าจะเปลี่ยนอะไรบ้าง อย่า Edit แล้วค่อยคิด</li>
            <li><strong>Use Keyboard:</strong> กด Enter เพื่อเพิ่มค่าเร็วกว่าคลิก + (สะดวกกว่า)</li>
            <li><strong>Review Before Save:</strong> ตรวจสอบค่าทุกฟิลด์ก่อนคลิก Save</li>
            <li><strong>Consistent Naming:</strong> ใช้รูปแบบการตั้งชื่อที่สม่ำเสมอ (เช่น Shift: A, B, C หรือ Day, Night)</li>
            <li><strong>Avoid Duplicates:</strong> ตรวจสอบก่อนเพิ่มค่าว่ามีอยู่แล้วหรือไม่</li>
            <li><strong>Keep it Simple:</strong> อย่าเพิ่มค่ามากเกินไป ควรมีเท่าที่จำเป็นเท่านั้น</li>
            <li><strong>Document Changes:</strong> บันทึกการเปลี่ยนแปลงสำคัญไว้สำหรับอ้างอิง</li>
          </ul>
        </div>

        <div style={{ background: '#e1f5fe', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81d4fa' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#0277bd', fontSize: '16px' }}>
            💡 เคล็ดลับการใช้งาน:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#01579b' }}>
            <li><strong>Batch Changes:</strong> แก้ไขหลายฟิลด์ในครั้งเดียวแล้วค่อย Save (ประหยัดเวลา)</li>
            <li><strong>Cancel is Safe:</strong> ไม่ต้องกลัวกด Cancel ค่าจะกลับมาเหมือนเดิมทั้งหมด</li>
            <li><strong>Watch Item Counter:</strong> ดูจำนวน "X / Y items" เพื่อรู้ว่าเหลือพื้นที่เท่าไหร่</li>
            <li><strong>Test First:</strong> ทดสอบเพิ่ม/ลบค่าก่อน จากนั้นค่อย Save</li>
            <li><strong>No Create/Delete:</strong> หน้านี้ไม่มีการสร้าง/ลบ Config แค่แก้ไข Active Config เดียวเท่านั้น</li>
          </ul>
        </div>

        <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '8px', border: '1px solid #ffb74d' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#e65100', fontSize: '16px' }}>
            🎯 ประโยชน์ของการตั้งค่าที่ดี:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#5d4037' }}>
            <li><strong>Consistency:</strong> ทีมทั้งหมดใช้ค่าเดียวกัน ลดความสับสน</li>
            <li><strong>Flexibility:</strong> สามารถปรับค่าตามความต้องการได้ง่าย</li>
            <li><strong>Accuracy:</strong> จำนวนสุ่มตัวอย่างที่ถูกต้องช่วยให้ผลตรวจสอบแม่นยำ</li>
            <li><strong>Scalability:</strong> เพิ่ม Site/Product ใหม่ได้ง่ายเมื่อขยายธุรกิจ</li>
            <li><strong>Maintenance:</strong> ง่ายต่อการดูแลและอัปเดตค่าในอนาคต</li>
          </ul>
        </div>
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
        <p style={{ marginTop: '10px' }}>หรือดูคู่มือการใช้งานเพิ่มเติมในเมนู Training</p>
        <p style={{ marginTop: '10px', fontWeight: 'bold' }}>สิ่งสำคัญที่ต้องจำ:</p>
        <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
          <li>หน้านี้ไม่มีการ CREATE/DELETE - แค่ UPDATE Configuration เดียว</li>
          <li>ต้องมี Active Configuration ในระบบก่อน</li>
          <li>ใช้ Array Value Manager เพื่อจัดการค่าหลาย ๆ ค่า</li>
          <li>กด Enter เพื่อเพิ่มค่า (ไม่ต้องคลิก +)</li>
          <li>Cancel จะ Restore ค่าเดิมทั้งหมด (ปลอดภัย)</li>
          <li>Save จะส่งเฉพาะฟิลด์ที่เปลี่ยนแปลง</li>
        </ul>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T13_InspectionDataSetupPage;
