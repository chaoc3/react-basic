// src/components/CardCarousel.js

import React from "react";
import Slider from "react-slick";

// 1. 导入 react-slick 必需的 CSS 文件
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import './CardCarousel.css';
// 2. 导入我们自己的样式文件和图片
import './CardCarousel.css';
import NextArrowImg from '..//assets//网页素材//向右.svg'; // 确保路径正确
import PrevArrowImg from '..//assets//网页素材//向左.svg'; // 确保路径正确

// 自定义 "下一张" 箭头组件 (保持不变)
function NextArrow(props) {
  const { className, onClick } = props;
  return (
    <div className={className} onClick={onClick}>
      <img src={NextArrowImg} alt="next" style={{ width: '40px', height: '40px' }} />
    </div>
  );
}

// 自定义 "上一张" 箭头组件 (保持不变)
function PrevArrow(props) {
  const { className, onClick } = props;
  return (
    <div className={className} onClick={onClick}>
      <img src={PrevArrowImg} alt="previous" style={{ width: '40px', height: '40px' }} />
    </div>
  );
}

/**
 * 通用卡片轮播组件
 * @param {object} props
 * @param {Array<React.ReactNode>} props.cards - 要渲染的卡片组件数组
 * @param {function} props.onSlideChange - 轮播切换时的回调函数，返回当前 slide 的索引
 */
function CardCarousel({ cards, onSlideChange }) {
  // 3. 配置轮播参数
  const settings = {
    dots: false,       
    infinite: cards.length > 1, // 如果只有一张卡片，则不循环
    speed: 500,        
    slidesToShow: 1,   
    slidesToScroll: 1, 
    centerMode: true,  
    centerPadding: "20%", // 两边卡片露出的部分
    nextArrow: <NextArrow />, 
    prevArrow: <PrevArrow />,
    // 关键：当轮播切换后，调用父组件传递的回调函数
    afterChange: (current) => {
      if (onSlideChange) {
        onSlideChange(current);
      }
    }
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        {/* 遍历从 props 接收的 cards 数组 */}
        {cards.map((cardComponent, index) => (
          <div key={index} className="card-slide">
            {cardComponent}
          </div>
        ))}
      </Slider>
      {/* 移除固定的按钮，由父组件控制 */}
    </div>
  );
}

export default CardCarousel;