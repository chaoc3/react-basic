import React from "react";
import Slider from "react-slick";

// 1. 导入 react-slick 必需的 CSS 文件
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";

// 2. 导入我们自己的样式文件和图片
import './CardCarousel.css';
import card1 from 'D:\\react\\react-basic\\src\\assets\\卡片\\卡片反面-细化页\\User-1-2.png'; // 导入卡片1
import card2 from 'D:\\react\\react-basic\\src\\assets\\卡片\\卡片反面-细化页\\User-2-2.png'; // 导入卡片2
import NextArrowImg from 'D:\\react\\react-basic\\src\\assets\\向右.png'; // 导入右箭头
import PrevArrowImg from 'D:\\react\\react-basic\\src\\assets\\向左.png'; // 导入左箭头

// 自定义 "下一张" 箭头组件
function NextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}
    >
      <img src={NextArrowImg} alt="next" style={{ width: '140px', height: '140px' }} />
    </div>
  );
}

// 自定义 "上一张" 箭头组件
function PrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      onClick={onClick}
    >
      <img src={PrevArrowImg} alt="previous" style={{ width: '140px', height: '140px' }} />
    </div>
  );
}

function CardCarousel() {
  // 3. 配置轮播参数
  const settings = {
    dots: false,       // 不显示下方的点
    infinite: true,    // 无限循环
    centerPadding: "140px",
    speed: 500,        // 切换速度
    slidesToShow: 1,   // 一次显示一张卡片
    slidesToScroll: 1, // 一次滚动一张卡片
    centerMode: true,  // 居中模式
    centerPadding: "20%", // 居中模式下，两边卡片露出的部分
    nextArrow: <NextArrow />, // 使用我们自定义的右箭头
    prevArrow: <PrevArrow />  // 使用我们自定义的左箭头
  };

  return (
    <div className="carousel-container">
      <Slider {...settings}>
        <div className="card-slide">
          <img src={card1} alt="卡片1：慢病患者" />
        </div>
        <div className="card-slide">
          <img src={card2} alt="卡片2：健康风险群体" />
        </div>
        {/* 如果您有更多卡片，可以继续在这里添加 */}
        {/* <div className="card-slide">
          <img src={card3} alt="卡片3" />
        </div> */}
      </Slider>
      <button className="confirm-button">确认选择</button>
    </div>
  );
}

export default CardCarousel;