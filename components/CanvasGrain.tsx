import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

export default function CanvasGrain() {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none" className="z-[-2]">
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        {/* Let's generate a beautiful distributed pattern of artistic grain */}
        {/* Group 1: Micro dots */}
        {Array.from({ length: 40 }).map((_, i) => {
          const x = (i * 97 + 23) % width;
          const y = (i * 131 + 47) % height;
          return (
            <Circle
              key={`dot-${i}`}
              cx={x}
              cy={y}
              r={1}
              fill="#141210"
              opacity={0.03}
            />
          );
        })}

        {/* Group 2: Fine paper fiber lines */}
        {Array.from({ length: 25 }).map((_, i) => {
          const x = (i * 163 + 79) % width;
          const y = (i * 107 + 13) % height;
          const len = 4 + (i % 6);
          const angle = (i * 30) % 360;
          const rad = (angle * Math.PI) / 180;
          const x2 = x + len * Math.cos(rad);
          const y2 = y + len * Math.sin(rad);
          return (
            <Line
              key={`line-${i}`}
              x1={x}
              y1={y}
              x2={x2}
              y2={y2}
              stroke="#141210"
              strokeWidth={0.5}
              opacity={0.025}
            />
          );
        })}

        {/* Group 3: Gold canvas sparkles (faint) */}
        {Array.from({ length: 15 }).map((_, i) => {
          const x = (i * 223 + 41) % width;
          const y = (i * 193 + 89) % height;
          return (
            <Circle
              key={`sparkle-${i}`}
              cx={x}
              cy={y}
              r={1.5}
              fill="#C26D5C"
              opacity={0.02}
            />
          );
        })}
      </Svg>
    </View>
  );
}
