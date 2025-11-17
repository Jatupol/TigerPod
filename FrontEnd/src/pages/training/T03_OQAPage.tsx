// client/src/pages/training/T03_OQAPage.tsx
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
const T03_OQAPage: React.FC = () => {
  return (
    <TrainingLayout
      cardNumber={3}
      totalCards={10}
      title="การตรวจสอบ OQA"
      subtitle="OQA Inspection Recording"
      icon="🔍"
      nextLink="/training/t04"
    >

      {/* Section 2: Navigation to OQA */}
      <Section title="การเข้าถึงหน้า OQA Inspection">
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/03_OQAList.png"
            alt="Login Screen"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 1: หน้า OQA Sampling Lists
          </p>
        </div>        
        <StepBox
          steps={[
            {
              label: 'ขั้นตอนที่ 1',
              description: 'เข้าสู่ระบบและไปที่หน้า Dashboard',
            },
            {
              label: 'ขั้นตอนที่ 2',
              description: 'คลิกที่เมนู "Inspection" → เลือก "OQA Inspection"',
            },
            {
              label: 'ขั้นตอนที่ 3',
              description: 'คลิกปุ่ม "New OQA" สีส้มเพื่อเริ่มการตรวจสอบใหม่',
            },
          ]}
        />

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/03_OQAPage1.png"
            alt="Login Screen"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 2: หน้า จอสำหรับบันทึกการตรวจสอบ OQA Spteps 1 - 2
          </p>
        </div>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <img
            src="/Images/training/03_OQAPage2.png"
            alt="Login Screen"
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #ddd',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          />
          <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
            ภาพที่ 3: หน้า จอสำหรับบันทึกการตรวจสอบ OQA Spteps 3 - 4
          </p>
        </div>                
      </Section>

      {/* Section 3: 4-Step Inspection Process */}
      <Section title="ขั้นตอนการบันทึกการตรวจสอบ OQA (4 ขั้นตอน)">

        {/* Step 1: Sampling Reason */}
        <Subsection title="📋 ขั้นตอนที่ 1: เลือกเหตุผลการสุ่มตัวอย่าง (Sampling Reason)" />
        <StepBox
          steps={[
            {
              label: 'การทำงาน',
              description: 'คลิกปุ่ม "Select Sampling Reason" เพื่อเปิดหน้าต่างเลือกเหตุผล',
            },
            {
              label: 'เลือกเหตุผล',
              description: 'เลือกเหตุผลที่เหมาะสม เช่น "Regular Inspection", "Customer Complaint", "Process Change" เป็นต้น',
            },
            {
              label: 'ยืนยัน',
              description: 'คลิกปุ่ม "Select" เพื่อยืนยันการเลือก - ระบบจะแสดงเหตุผลที่เลือกในกล่องสีชมพู',
            },
          ]}
        >
          <div style={{ background: '#fff3e0', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#e65100' }}>
              💡 <strong>เคล็ดลับ:</strong> หากต้องการเปลี่ยนเหตุผล คลิกปุ่ม "Change" ที่อยู่ด้านขวาของกล่องข้อมูล
            </p>
          </div>
                  
        </StepBox>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <img
              src="/Images/training/03_OQAReason.png"
              alt="Login Screen"
              style={{
                maxWidth: '100%',
                height: 'auto',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              ภาพที่ 4: หน้าจอสำหรับเลือกเหตุผลการสุ่มตัวอย่าง
            </p>
          </div>  

        {/* Step 2: Lot Selection */}
        <Subsection title="📦 ขั้นตอนที่ 2: เลือก Lot ที่ต้องการตรวจสอบ" />
        <StepBox
          steps={[
            {
              label: 'ค้นหา Lot',
              description: 'กรอกเลข Lot Number ในช่องค้นหา หรือใช้ปุ่ม "Browse" เพื่อเปิดหน้าต่างค้นหา Lot',
            },
            {
              label: 'ตรวจสอบข้อมูล',
              description: 'ตรวจสอบข้อมูล Lot: Part Site, Line No, Item No, Model, Version',
            },
            {
              label: 'ยืนยัน',
              description: 'คลิก "Select" เพื่อยืนยัน - ระบบจะแสดงข้อมูล Lot และ Sampling Round อัตโนมัติ',
            },
          ]}
        >
          <div style={{ background: '#e1f5fe', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#01579b' }}>
              ℹ️ <strong>หมายเหตุ:</strong> Sampling Round จะถูกคำนวณอัตโนมัติตามจำนวนครั้งที่ Lot นี้ถูกตรวจสอบแล้ว
            </p>
          </div>
           
        </StepBox>
          <div style={{ marginBottom: '20px', textAlign: 'center' }}>
            <img
              src="/Images/training/03_OQALot.png"
              alt="Login Screen"
              style={{
                maxWidth: '100%',
                height: 'auto',
                border: '1px solid #ddd',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}
            />
            <p style={{ marginTop: '10px', fontSize: '14px', color: '#666', fontStyle: 'italic' }}>
              ภาพที่ 4: หน้าจอสำหรับเลือก Lot ที่ต้องการตรวจสอบ
            </p>
          </div> 
        {/* Step 3: Sampling Configuration */}
        <Subsection title="⚙️ ขั้นตอนที่ 3: กำหนดค่าการสุ่มตัวอย่าง (Sampling Configuration)" />
        <StepBox
          steps={[
            {
              label: 'FVI Lot Qty',
              description: 'กรอกจำนวนชิ้นงานทั้งหมดใน Lot (Total quantity in the lot)',
            },
            {
              label: 'General Sampling Qty',
              description: 'กรอกหรือเลือกจำนวนชิ้นงานที่สุ่มตรวจสอบทั่วไป - ระบบจะแสดงค่าที่แนะนำตามการตั้งค่า',
            },
            {
              label: 'Crack Sampling Qty',
              description: 'กรอกหรือเลือกจำนวนชิ้นงานที่สุ่มตรวจหารอยร้าว - ระบบจะแสดงค่าที่แนะนำตามการตั้งค่า',
            },
          ]}
        >
        </StepBox>

        {/* Step 4: Lot Judgment */}
        <Subsection title="✅ ขั้นตอนที่ 4: ตัดสินผลการตรวจสอบ (Lot Judgment)" />
        <StepBox
          steps={[
            {
              label: 'ตรวจสอบชิ้นงาน',
              description: 'ทำการตรวจสอบชิ้นงานตามจำนวนที่กำหนดใน Sampling Configuration',
            },
            {
              label: 'เลือกผลการตรวจ',
              description: 'คลิกปุ่ม "PASS" (สีเขียว) หากผ่านการตรวจสอบ หรือ "REJECT" (สีแดง) หากไม่ผ่าน',
            },
            {
              label: 'ส่งข้อมูล',
              description: 'คลิกปุ่ม "Complete Inspection" สีส้มขนาดใหญ่ด้านล่างเพื่อบันทึกผลการตรวจสอบ',
            },
          ]}
        >
          <div style={{ background: '#fff9c4', padding: '12px', borderRadius: '6px', marginTop: '10px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#f57f17' }}>
              ⚠️ <strong>คำเตือน:</strong> กรุณาตรวจสอบข้อมูลให้ครบถ้วนทั้ง 4 ขั้นตอนก่อนคลิก "Complete Inspection"
            </p>
          </div>
        </StepBox>
      </Section>

      {/* Section 4: After Submission */}
      <Section title="หลังจากบันทึกการตรวจสอบ">
        <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '1px solid #81c784' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2e7d32', fontSize: '16px' }}>
            🎉 กรณีผลการตรวจสอบ PASS:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#1b5e20' }}>
            <li>ระบบจะถามว่าต้องการสร้าง SIV Inspection หรือไม่</li>
            <li>คลิก "Yes, Create SIV" เพื่อสร้างการตรวจสอบ SIV อัตโนมัติ</li>
            <li>คลิก "No, Skip" เพื่อข้ามและเริ่มการตรวจสอบใหม่ โดยสามารถสร้างรายการ SIV Inspection ใหม่ได้ภายหลัง </li>
          </ul>
        </div>

        <div style={{ background: '#ffebee', padding: '15px', borderRadius: '8px', border: '1px solid #ef5350' }}>
          <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#c62828', fontSize: '16px' }}>
            ❌ กรณีผลการตรวจสอบ REJECT:
          </p>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#b71c1c' }}>
            <li>ระบบจะบันทึกผลและรีเซ็ตฟอร์มสำหรับการตรวจสอบครั้งต่อไป</li>
            <li>Lot ที่ Reject จะต้องผ่านกระบวนการ Rework</li>
            <li>สามารถดูรายการที่ Reject ได้ที่หน้า "OQA Sampling Lists"</li>
          </ul>
        </div>
      </Section>

      {/* Section 5: Troubleshooting */}
      <Section title="การแก้ไขปัญหาที่พบบ่อย">
        <Table
          headers={['ปัญหา', 'วิธีแก้ไข']}
          rows={[
            [
              'ไม่สามารถเลือก Sampling Reason ได้',
              'ตรวจสอบว่าได้เข้าสู่ระบบแล้ว และมีสิทธิ์ในการเข้าถึงหน้า OQA Inspection',
            ],
            [
              'ไม่พบ Lot Number ที่ต้องการ',
              'ตรวจสอบว่า Lot Number ถูกต้อง และได้ทำการ Check-in ในระบบแล้ว',
            ],
            [
              'ปุ่ม Complete Inspection ไม่สามารถคลิกได้',
              'ตรวจสอบว่าได้กรอกข้อมูลครบทั้ง 4 ขั้นตอน: Sampling Reason, Lot, Configuration, และ Judgment',
            ],
            [
              'ค่า Sampling Qty ไม่แสดงอัตโนมัติ',
              'ตรวจสอบการตั้งค่าระบบ (System Configuration) หรือติดต่อผู้ดูแลระบบ',
            ],
            [
              'ไม่สามารถส่งข้อมูลได้',
              'ตรวจสอบการเชื่อมต่ออินเทอร์เน็ต, รีเฟรชหน้า (F5), หรือติดต่อฝ่าย IT',
            ],
          ]}
        />
      </Section>

      {/* Help Box */}
      <HelpBox title="❓ ต้องการความช่วยเหลือ?">
        <p>ติดต่อผู้ดูแลระบบหรือฝ่าย IT</p>
      </HelpBox>
    </TrainingLayout>
  );
};

export default T03_OQAPage;
