// src/pages/Page17_Achieve.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown'; 

// Component Imports
import BranchSelector from '../components/BranchSelector';
import ChatDialog from '../components/ChatDialog';
import styles from './styles/Page17_Achieve.module.css'; 
import { useDesign } from '../context/DesignContext';
import { getAiResponse } from '../services/aiService';

const Page17_Achieve = () => {
  const navigate = useNavigate();
  const { designData } = useDesign();

  const [reportContent, setReportContent] = useState("正在生成最终设计报告，请稍候...");
  const [isEditing, setIsEditing] = useState(false);
  
  // 【修复1】引入 useRef 锁，确保报告只生成一次
  const hasGenerated = useRef(false);

  // --- 报告生成逻辑 ---
  useEffect(() => {
    const generateReport = async () => {
      // 1. 检查锁，防止重复执行
      if (hasGenerated.current) return;
      hasGenerated.current = true;

      // 2. 检查数据完整性
      if (!designData.targetUser || !designData.modeCard) {
          setReportContent("# 错误\n\n设计数据不完整，请从头开始流程。");
          return;
      }

      try {
        // 3. 调用 AI
        const aiResult = await getAiResponse([], 'generateFinalReport', designData);

        if (aiResult.responseText) {
            setReportContent(aiResult.responseText);
        } else {
            setReportContent("# 错误\n\n抱歉，报告生成失败，请检查后端服务。");
        }
      } catch (error) {
        console.error("Report Generation Error:", error);
        setReportContent("# 错误\n\n生成过程中发生网络错误。");
      }
    };

    generateReport();
    // 依赖数组留空，或者只放 designData (配合 useRef 锁是安全的)
  }, [designData]);

  // --- 编辑/保存 切换 ---
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  // --- 导出 Markdown ---
  const handleExport = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "design_report.md");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- 导出 JSON 数据 ---
  const handleExportData = () => {
    const jsonData = JSON.stringify(designData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "design_data.json"); // 建议改为 .json 后缀
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- 辅助对话框逻辑 ---
  // 【修复2】更新函数签名以匹配 ChatDialog 的新逻辑
  // 虽然这里是假回复，但参数结构要对，防止报错
  const sideChatSendMessage = async (userInput, currentMessages) => {
    // 这里可以扩展为真实的 AI 咨询，目前保持为静态回复
    // 如果你想让它真的能聊天，可以调用 getAiResponse(currentMessages, 'freeChat', ...)
    return { 
      responseText: "这是辅助对话框的回复。您可以在这里查询设计理论或寻求建议。",
      isTaskComplete: false,
      extractedData: null
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.leftPanel}>
        <BranchSelector activeStageId={9} /> 
      </div>

      <div className={styles.mainContent}>
        <div className={styles.reportWrapper}>
          <div className={styles.buttonContainer}>
            <button onClick={handleEditToggle} className={styles.actionButton}>
              {isEditing ? '保存' : '编辑'}
            </button>
            <button onClick={handleExport} className={styles.actionButton}>
              导出报告
            </button>
            <button onClick={handleExportData} className={styles.actionButton}>
              导出数据
            </button>
          </div>

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
          // 移除了 isInputEnabled，因为 ChatDialog 默认就是开启输入的
        />
      </div>
    </div>
  );
};

export default Page17_Achieve;