// client/src/pages/training/IndexPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { type TrainingCard } from '../../types/training.types';
import './Training.css';

/**
 * Training Index Page
 *
 * Main landing page for training materials and documentation
 * Shows all available training cards organized by sections
 */
const IndexPage: React.FC = () => {
  // Section 1: Operation Cards
  const operationCards: TrainingCard[] = [
    {
      id: 1,
      icon: '🔐',
      title: 'หัวข้อ #1: การเข้าสู่ระบบ',
      description: 'เรียนรู้วิธีเข้าสู่ระบบ',
      path: '/training/t01',
      filename: 't01',
      isActive: true,
    },
    {
      id: 2,
      icon: '📋',
      title: 'หัวข้อ #2: ภาพรวมการตรวจสอบ OQA',
      description: 'อธิบาย Flow และการคำนวณต่างๆ ในการตรวจสอบ OQA',
      path: '/training/t02',
      filename: 't02',
      isActive: true,
    },
    {
      id: 3,
      icon: '📋',
      title: 'หัวข้อ #3: การบันทึกข้อมูล OQA',
      description: 'คู่มือทีละขั้นตอนสำหรับการบันทึกการตรวจสอบ OQA',
      path: '/training/t03',
      filename: 't03',
      isActive: true,
    },
    {
      id: 4,
      icon: '📋',
      title: 'หัวข้อ #4: การบันทึกข้อมูล OBA',
      description: 'คู่มือทีละขั้นตอนสำหรับการบันทึกการตรวจสอบ OBA',
      path: '/training/t04',
      filename: 't04',
      isActive: true,
    },
    {
      id: 5,
      icon: '📋',
      title: 'หัวข้อ #5: การตรวจสอบ SIV',
      description: 'คู่มือทีละขั้นตอนสำหรับการบันทึกการตรวจสอบ SIV',
      path: '/training/t05',
      filename: 't05',
      isActive: true,
    },
    {
      id: 6,
      icon: '📸',
      title: 'หัวข้อ #6: การบันทึกข้อบกพร่อง',
      description: 'วิธีบันทึกข้อบกพร่องพร้อมรูปภาพและเอกสารที่เหมาะสม',
      path: '/training/t06',
      filename: 't06',
      isActive: true,
    },
    {
      id: 7,
      icon: '📊',
      title: 'หัวข้อ #7: การจัดการข้อมูล IQA',
      description: 'นำเข้าข้อมูล IQA และวิเคราะห์ผล',
      path: '/training/t07',
      filename: 't07',
      isActive: true,
    },
  ];

  // Section 2: Setting Cards
  const settingCards: TrainingCard[] = [
    {
      id: 10,
      icon: '🔧',
      title: 'หัวข้อ #10: การตั้งค่าไซต์ลูกค้า',
      description: 'การจัดการข้อมูลไซต์ลูกค้าและการตั้งค่า (Customer Site Management)',
      path: '/training/t10',
      filename: 't10',
      isActive: true,
    },
    {
      id: 11,
      icon: '🔧',
      title: 'หัวข้อ #11: การจัดการข้อมูลหลักของลูกค้า',
      description: 'การจัดการข้อมูลลูกค้าและรายละเอียดที่เกี่ยวข้อง (Customer Master Data)',
      path: '/training/t11',
      filename: 't11',
      isActive: true,
    },
    {
      id: 12,
      icon: '🔧',
      title: 'หัวข้อ #12: การจัดการข้อมูลข้อบกพร่อง',
      description: 'คู่มือที่สมบูรณ์สำหรับการจัดการข้อมูลข้อบกพร่อง (Defects)',
      path: '/training/t12',
      filename: 't12',
      isActive: true,
    },
    {
      id: 13,
      icon: '🔧',
      title: 'หัวข้อ #13: การตั้งค่าข้อมูลการตรวจสอบ',
      description: 'คู่มือที่สมบูรณ์สำหรับการตั้งค่าข้อมูลการตรวจสอบ (Inspection Data Setup)',
      path: '/training/t13',
      filename: 't13',
      isActive: true,
    },
  ];

  // Section 3: Report Cards
  const reportCards: TrainingCard[] = [
    {
      id: 8,
      icon: '📊',
      title: 'หัวข้อ #8: รายงาน OQA DPPM Overall',
      description: 'คู่มือการสร้างและดูรายงาน OQA DPPM Overall',
      path: '/training/t08',
      filename: 't08',
      isActive: false,
    },
    {
      id: 9,
      icon: '📊',
      title: 'หัวข้อ #9: รายงาน SGT IQA Trend',
      description: 'คู่มือการสร้างและดูรายงาน SGT IQA Trend',
      path: '/training/t09',
      filename: 't09',
      isActive: false,
    },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="training-index-container">
      {/* Floating Decorative Elements */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
      </div>
      {/* Navigation Bar */}
      <nav className="training-index-nav">
        <div className="training-index-nav-title">📚 คู่มือการใช้งาน</div>
        <div className="training-index-nav-buttons">
          <Link to="/" className="training-index-nav-btn">
            🏠 กลับสู่หน้าหลัก
          </Link>
          <button onClick={handlePrint} className="training-index-nav-btn training-index-print-btn">
            🖨️ พิมพ์หน้านี้
          </button>
        </div>
      </nav>

      {/* Header */}
      <header className="training-index-header">
        <h1>📚 คู่มือการใช้งาน</h1>
        <p>Sampling Inspection Control System</p>
        <p className="training-index-subtitle">เลือกหัวข้อเพื่อดูหรือพิมพ์</p>
      </header>

      {/* Section 1: Operation */}
      <section className="training-section">
        <h2 className="training-section-title">
          <span className="training-section-icon">⚙️</span>
          <span style={{ position: 'relative', zIndex: 1 }}>การดำเนินงาน (Operation)</span>
        </h2>
        <div className="training-index-cards-grid">
          {operationCards.map((card) => (
            <TrainingCardComponent key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* Section 2: Setting */}
      <section className="training-section">
        <h2 className="training-section-title">
          <span className="training-section-icon">🔧</span>
          <span style={{ position: 'relative', zIndex: 1 }}>การตั้งค่า (Setting)</span>
        </h2>
        <div className="training-index-cards-grid">
          {settingCards.map((card) => (
            <TrainingCardComponent key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* Section 3: Report */}
      <section className="training-section">
        <h2 className="training-section-title">
          <span className="training-section-icon">📊</span>
          <span style={{ position: 'relative', zIndex: 1 }}>รายงาน (Report)</span>
        </h2>
        <div className="training-index-cards-grid">
          {reportCards.map((card) => (
            <TrainingCardComponent key={card.id} card={card} />
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="training-index-footer">
        <p>
          <strong>Sampling Inspection Control System</strong>
        </p>
        <p className="training-index-footer-date">ตุลาคม 2025</p>
      </footer>
    </div>
  );
};

// ==================== TRAINING CARD COMPONENT ====================

interface TrainingCardComponentProps {
  card: TrainingCard;
}

const TrainingCardComponent: React.FC<TrainingCardComponentProps> = ({ card }) => {
  const cardStyle = card.isActive ? {} : { opacity: 0.7, cursor: 'default' };

  const handleClick = (e: React.MouseEvent) => {
    if (!card.isActive) {
      e.preventDefault();
    } else if (card.filename) {
      // Prevent default <a> behavior since we're using window.open
      e.preventDefault();
      // Open HTML file in new tab
      window.open(`/training/${card.filename}`, '_blank');
    }
  };

  return (
    <div className="training-index-card" style={cardStyle}>
      <div className="training-index-card-icon">{card.icon}</div>
      <h2>{card.title}</h2>
      <p>{card.description}</p>
      {card.isActive ? (
        card.filename ? (
          <a
            href={`/training/${card.filename}`}
            className="training-index-view-button"
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
          >
            ดูคู่มือ →
          </a>
        ) : (
          <Link to={card.path} className="training-index-view-button">
            ดูคู่มือ →
          </Link>
        )
      ) : (
        <span className="training-index-view-button training-index-disabled-button">
          เร็วๆ นี้
        </span>
      )}
    </div>
  );
};

export default IndexPage;
