// components/animations/FadeInView.js
import React, { useEffect } from 'react';
import { Animated } from 'react-native';

export default function FadeInView({ style, children }) {
  const fadeAnim = new Animated.Value(0); // 0 is fully transparent, 1 is fully opaque

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  return (
    <Animated.View style={{ ...style, opacity: fadeAnim }}>
      {children}
    </Animated.View>
  );
}
