import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polygon, Circle, Path, Polyline, Line } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function AbstractShapes() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none" className="z-[-1] opacity-25">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        
        {/* Triangle incliné (Top Left) */}
        <Polygon
          points="50,15 90,85 10,85"
          fill="none"
          stroke="#C26D5C"
          strokeWidth="1.5"
          transform="translate(15, 100) rotate(15) scale(0.8)"
        />
        
        {/* Cercle minimaliste outline (Middle Right) */}
        <Circle
          cx={width - 60}
          cy={height * 0.35}
          r={50}
          fill="none"
          stroke="#141210"
          strokeWidth="1"
          opacity={0.2}
        />
        
        {/* Trait courbé abstrait (Bottom Left) */}
        <Path
          d="M 20 150 Q 80 10 120 180 T 180 40"
          fill="none"
          stroke="#C26D5C"
          strokeWidth="1.5"
          opacity={0.3}
          transform={`translate(30, ${height * 0.55}) scale(1.1)`}
        />
        
        {/* Traits Zigzag (Middle Left) */}
        <Polyline
          points="10,50 30,20 50,80 70,20 90,50"
          fill="none"
          stroke="#141210"
          strokeWidth="2"
          opacity={0.25}
          transform={`translate(20, ${height * 0.28}) rotate(35) scale(0.6)`}
        />
        
        {/* Picots / Petits points épars */}
        <Circle cx={width * 0.72} cy={height * 0.08} r={1.5} fill="#C26D5C" />
        <Circle cx={width * 0.6} cy={height * 0.14} r={1.5} fill="#C26D5C" />
        <Circle cx={width * 0.85} cy={height * 0.22} r={2} fill="#C26D5C" />
        <Circle cx={width * 0.78} cy={height * 0.18} r={1} fill="#C26D5C" />
        <Circle cx={width * 0.65} cy={height * 0.05} r={1.5} fill="#C26D5C" />
        
        {/* Ligne diagonale franche (Bottom Right) */}
        <Line
          x1="10"
          y1="90"
          x2="90"
          y2="10"
          stroke="#141210"
          strokeWidth="2.5"
          opacity={0.15}
          transform={`translate(${width - 120}, ${height * 0.82}) rotate(-20) scale(0.9)`}
        />
        
        {/* Croix (+) orientée (Top Middle) */}
        <Line x1={width * 0.42} y1={height * 0.22 - 20} x2={width * 0.42} y2={height * 0.22 + 20} stroke="#C26D5C" strokeWidth="1.5" opacity={0.4} />
        <Line x1={width * 0.42 - 20} y1={height * 0.22} x2={width * 0.42 + 20} y2={height * 0.22} stroke="#C26D5C" strokeWidth="1.5" opacity={0.4} />
      </Svg>
    </View>
  );
}
