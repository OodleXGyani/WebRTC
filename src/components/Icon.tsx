import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { Colors } from '../constants/theme';

interface IconProps {
  name: string;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export default function Icon({
  name,
  size = 24,
  color = Colors.text,
  strokeWidth = 2,
}: IconProps) {
  const getEmojiStyle = (fontSize: number) => ({
    fontSize,
    lineHeight: fontSize,
  });

  const renderIcon = () => {
    const s = size;
    const c = color;

    switch (name) {
      case 'Phone':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              styles.box,
              { 
                width: s * 0.6, 
                height: s * 0.8, 
                borderColor: c, 
                borderRadius: s * 0.1,
                borderWidth: strokeWidth
              }
            ]} />
            <View style={[
              { width: s * 0.3, height: strokeWidth * 1.5, backgroundColor: c, marginTop: -s * 0.1 }
            ]} />
          </View>
        );

      case 'PlusCircle':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              styles.circle,
              { 
                width: s * 0.8, 
                height: s * 0.8, 
                borderColor: c,
                borderWidth: strokeWidth
              }
            ]}>
              <View style={[{ width: s * 0.4, height: strokeWidth * 2, backgroundColor: c }]} />
              <View style={[{ width: strokeWidth * 2, height: s * 0.4, backgroundColor: c, position: 'absolute' }]} />
            </View>
          </View>
        );

      case 'Link':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              { 
                width: s * 0.7, 
                height: strokeWidth * 2, 
                backgroundColor: c,
                transform: [{ rotate: '45deg' }]
              }
            ]} />
            <View style={[
              styles.circle,
              { 
                width: s * 0.3, 
                height: s * 0.3, 
                borderColor: c,
                borderWidth: strokeWidth,
                position: 'absolute',
                left: s * 0.05,
                top: s * 0.35,
              }
            ]} />
            <View style={[
              styles.circle,
              { 
                width: s * 0.3, 
                height: s * 0.3, 
                borderColor: c,
                borderWidth: strokeWidth,
                position: 'absolute',
                right: s * 0.05,
                bottom: s * 0.35,
              }
            ]} />
          </View>
        );

      case 'Video':
        return (
          <Text style={getEmojiStyle(size)}>📹</Text>
        );

      case 'VideoOff':
        return (
          <Text style={getEmojiStyle(size)}>📴</Text>
        );

      case 'Microphone':
        return (
          <Text style={getEmojiStyle(size)}>🎙️</Text>
        );

      case 'MicrophoneOff':
        return (
          <Text style={getEmojiStyle(size)}>🔇</Text>
        );

      case 'Globe':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              styles.circle,
              { 
                width: s * 0.75, 
                height: s * 0.75, 
                borderColor: c,
                borderWidth: strokeWidth
              }
            ]} />
            <View style={[
              { 
                width: strokeWidth * 2, 
                height: s * 0.6, 
                backgroundColor: c,
                position: 'absolute'
              }
            ]} />
            <View style={[
              { 
                width: s * 0.6, 
                height: strokeWidth * 2, 
                backgroundColor: c,
                position: 'absolute'
              }
            ]} />
          </View>
        );

      case 'Lock':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              {
                width: s * 0.5,
                height: s * 0.35,
                borderColor: c,
                borderWidth: strokeWidth,
                borderRadius: s * 0.08,
              }
            ]} />
            <View style={[
              styles.box,
              { 
                width: s * 0.7, 
                height: s * 0.45, 
                borderColor: c,
                borderWidth: strokeWidth,
                borderRadius: s * 0.08,
                marginTop: -s * 0.1
              }
            ]} />
          </View>
        );

      case 'PhoneOff':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              styles.box,
              { 
                width: s * 0.6, 
                height: s * 0.8, 
                borderColor: c, 
                borderRadius: s * 0.1,
                borderWidth: strokeWidth
              }
            ]} />
            <View style={[
              { 
                width: s * 0.8, 
                height: strokeWidth * 2.5, 
                backgroundColor: c,
                transform: [{ rotate: '-45deg' }],
                position: 'absolute'
              }
            ]} />
          </View>
        );

      case 'Copy':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              styles.box,
              {
                width: s * 0.6,
                height: s * 0.6,
                borderColor: c,
                borderWidth: strokeWidth,
              }
            ]} />
            <View style={[
              styles.box,
              {
                width: s * 0.6,
                height: s * 0.6,
                borderColor: c,
                borderWidth: strokeWidth,
                position: 'absolute',
                right: -s * 0.15,
                bottom: -s * 0.15,
              }
            ]} />
          </View>
        );

      case 'Zap':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View
              style={{
                width: strokeWidth * 1.5,
                height: s * 0.6,
                backgroundColor: c,
                transform: [{ rotate: '-20deg' }],
              }}
            />
            <View
              style={{
                width: strokeWidth * 1.5,
                height: s * 0.6,
                backgroundColor: c,
                transform: [{ rotate: '20deg' }],
                marginLeft: -s * 0.1,
              }}
            />
          </View>
        );

      case 'Users':
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View
              style={[
                styles.circle,
                {
                  width: s * 0.35,
                  height: s * 0.35,
                  borderColor: c,
                  borderWidth: strokeWidth,
                  position: 'absolute',
                  left: s * 0.05,
                  top: s * 0.1,
                },
              ]}
            />
            <View
              style={[
                styles.circle,
                {
                  width: s * 0.35,
                  height: s * 0.35,
                  borderColor: c,
                  borderWidth: strokeWidth,
                  position: 'absolute',
                  right: s * 0.05,
                  top: s * 0.1,
                },
              ]}
            />
            <View
              style={{
                width: s * 0.8,
                height: s * 0.3,
                borderColor: c,
                borderWidth: strokeWidth,
                borderTopLeftRadius: s * 0.15,
                borderTopRightRadius: s * 0.15,
                position: 'absolute',
                bottom: s * 0.05,
              }}
            />
          </View>
        );

      default:
        console.warn(`Icon "${name}" not found`);
        return (
          <View style={[styles.baseContainer, { width: s, height: s }]}>
            <View style={[
              styles.circle,
              { 
                width: s * 0.4, 
                height: s * 0.4, 
                backgroundColor: c
              }
            ]} />
          </View>
        );
    }
  };

  return renderIcon();
}

const styles = StyleSheet.create({
  baseContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  box: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    borderRadius: 9999,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
