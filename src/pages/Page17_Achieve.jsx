// src/pages/Page17_Achieve.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; // --- NEW: Import for rendering Markdown

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page17_Achieve.module.css'; 
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService';

const Page17_Achieve = () => {
  const navigate = useNavigate();
  const { designData } = useDesign();

  // --- MODIFIED: State for the report content and editing mode ---
  const [reportContent, setReportContent] = useState("正在生成最终设计报告，请稍候...");
  const [isEditing, setIsEditing] = useState(false); // NEW: State to toggle edit mode

  // AI report generation logic (mostly unchanged)
  const generateReport = useCallback(async () => {
    if (!designData.targetUser || !designData.modeCard) {
        setReportContent("# 错误\n\n设计数据不完整，请从头开始流程。");
        return;
    }
    const aiResult = await getAiResponse([], 'generateFinalReport', designData);

    if (aiResult.responseText) {
        setReportContent(aiResult.responseText); // Update the report content
    } else {
        setReportContent("# 错误\n\n抱歉，报告生成失败，请检查后端服务。");
    }
  }, [designData]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  // --- NEW: Handler for the Edit/Save button ---
  const handleEditToggle = () => {
    setIsEditing(!isEditing); // Simply toggle the state
  };

  // --- NEW: Handler for the Export button ---
  const handleExport = () => {
    // Create a blob with the report content
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    // Create a link element
    const link = document.createElement("a");
    // Create a URL for the blob
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "design_report.md"); // Set the file name
    // Append the link to the body, click it, and then remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Auxiliary chat function (unchanged)
  const sideChatSendMessage = async (input) => {
    return { responseText: "这是辅助对话框的回复。您可以在这里查询设计理论或寻求建议。" };
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector activeStageId={9} /> 
      </div>

      {/* --- MODIFIED: Main content area now holds the report display --- */}
      <div className={styles.mainContent}>
        <div className={styles.reportWrapper}>
          {/* --- NEW: Buttons for Edit and Export --- */}
          <div className={styles.buttonContainer}>
            <button onClick={handleEditToggle} className={styles.actionButton}>
              {isEditing ? '保存' : '编辑'}
            </button>
            <button onClick={handleExport} className={styles.actionButton}>
              导出
            </button>
          </div>

          {/* --- NEW: Conditional rendering for View/Edit mode --- */}
          {isEditing ? (
            <textarea
              className={`${styles.reportContainer} ${styles.reportTextarea}`}
              value={reportContent}
              onChange={(e) => setReportContent(e.target.value)}
            />
          ) : (
            <div className={styles.reportContainer}>
              <ReactMarkdown>{reportContent}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      <div className={styles.rightPanel}>
        <ChatDialog
          initialBotMessage="需要帮助吗？您可以在这里查询设计理论或寻求建议。"
          getAiResponse={sideChatSendMessage}
          isInputEnabled={true}
        />
      </div>
    </div>
  );
};

export default Page17_Achieve;