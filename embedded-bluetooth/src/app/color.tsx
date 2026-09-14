import React, { useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  StyleSheet,
  PanResponder,
  GestureResponderEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ---------- Layout constants ----------
const SQUARE_SIZE = 260;
const HUE_WIDTH = 260;
const HUE_HEIGHT = 28;
const POINTER_SIZE = 18;

// ---------- Color math helpers ----------
function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const cleaned = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned)) return null;
  return {
    r: parseInt(cleaned.substring(0, 2), 16),
    g: parseInt(cleaned.substring(2, 4), 16),
    b: parseInt(cleaned.substring(4, 6), 16),
  };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) =>
    Math.round(clamp(n, 0, 255)).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function rgbToHsv(r: number, g: number, b: number) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return { h, s, v };
}

function hsvToRgb(h: number, s: number, v: number) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r1 = 0,
    g1 = 0,
    b1 = 0;
  if (h < 60) {
    r1 = c;
    g1 = x;
    b1 = 0;
  } else if (h < 120) {
    r1 = x;
    g1 = c;
    b1 = 0;
  } else if (h < 180) {
    r1 = 0;
    g1 = c;
    b1 = x;
  } else if (h < 240) {
    r1 = 0;
    g1 = x;
    b1 = c;
  } else if (h < 300) {
    r1 = x;
    g1 = 0;
    b1 = c;
  } else {
    r1 = c;
    g1 = 0;
    b1 = x;
  }
  return {
    r: Math.round((r1 + m) * 255),
    g: Math.round((g1 + m) * 255),
    b: Math.round((b1 + m) * 255),
  };
}

function normalizeName(name: string) {
  return name.toLowerCase().replace(/[^a-z]/g, '');
}

// ---------- Named color list ----------
const NAMED_COLORS: { name: string; hex: string }[] = [
  { name: 'Royal Blue', hex: '#4169E1' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Crimson', hex: '#DC143C' },
  { name: 'Red', hex: '#FF0000' },
  { name: 'Orange Red', hex: '#FF4500' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'Green', hex: '#008000' },
  { name: 'Forest Green', hex: '#228B22' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Sky Blue', hex: '#87CEEB' },
  { name: 'Steel Blue', hex: '#4682B4' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Indigo', hex: '#4B0082' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Violet', hex: '#EE82EE' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Hot Pink', hex: '#FF69B4' },
  { name: 'Salmon', hex: '#FA8072' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Chocolate', hex: '#D2691E' },
  { name: 'Tan', hex: '#D2B48C' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Ivory', hex: '#FFFFF0' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Dark Gray', hex: '#A9A9A9' },
  { name: 'Light Gray', hex: '#D3D3D3' },
  { name: 'Black', hex: '#000000' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'Aquamarine', hex: '#7FFFD4' },
  { name: 'Khaki', hex: '#F0E68C' },
  { name: 'Lavender', hex: '#E6E6FA' },
  { name: 'Plum', hex: '#DDA0DD' },
  { name: 'Orchid', hex: '#DA70D6' },
  { name: 'Slate Gray', hex: '#708090' },
  { name: 'Midnight Blue', hex: '#191970' },
  { name: 'Dark Green', hex: '#006400' },
  { name: 'Sea Green', hex: '#2E8B57' },
  { name: 'Olive Drab', hex: '#6B8E23' },
  { name: 'Peru', hex: '#CD853F' },
  { name: 'Sienna', hex: '#A0522D' },
  { name: 'Rosy Brown', hex: '#BC8F8F' },
  { name: 'Firebrick', hex: '#B22222' },
  { name: 'Dark Red', hex: '#8B0000' },
  { name: 'Tomato', hex: '#FF6347' },
  { name: 'Peach Puff', hex: '#FFDAB9' },
  { name: 'Wheat', hex: '#F5DEB3' },
  { name: 'Cornflower Blue', hex: '#6495ED' },
  { name: 'Dodger Blue', hex: '#1E90FF' },
  { name: 'Deep Sky Blue', hex: '#00BFFF' },
  { name: 'Powder Blue', hex: '#B0E0E6' },
  { name: 'Light Blue', hex: '#ADD8E6' },
  { name: 'Medium Blue', hex: '#0000CD' },
  { name: 'Dark Blue', hex: '#00008B' },
  { name: 'Amethyst', hex: '#9966CC' },
  { name: 'Charcoal', hex: '#36454F' },
  { name: 'Mint', hex: '#98FF98' },
];

const NAMED_COLOR_MAP: Record<string, string> = {};
NAMED_COLORS.forEach((c) => {
  NAMED_COLOR_MAP[normalizeName(c.name)] = c.hex;
});

function findNearestColorName(r: number, g: number, b: number): string {
  let best = NAMED_COLORS[0];
  let bestDist = Infinity;
  for (const c of NAMED_COLORS) {
    const rgb = hexToRgb(c.hex)!;
    const dist = (rgb.r - r) ** 2 + (rgb.g - g) ** 2 + (rgb.b - b) ** 2;
    if (dist < bestDist) {
      bestDist = dist;
      best = c;
    }
  }
  return best.name;
}

// ---------- Component ----------
export default function Color() {
  const initialRgb = hexToRgb('#4169E1')!;
  const initialHsv = rgbToHsv(initialRgb.r, initialRgb.g, initialRgb.b);

  const [hexText, setHexText] = useState('#4169E1');
  const [nameText, setNameText] = useState('Royal Blue');
  const [hue, setHue] = useState(initialHsv.h);
  const [sat, setSat] = useState(initialHsv.s);
  const [val, setVal] = useState(initialHsv.v);
  const [scrollEnabled, setScrollEnabled] = useState(true);

  const squareRef = useRef<View>(null);
  const hueRef = useRef<View>(null);

  function updateAll(r: number, g: number, b: number) {
    const hex = rgbToHex(r, g, b);
    const hsv = rgbToHsv(r, g, b);
    setHexText(hex);
    setHue(hsv.h);
    setSat(hsv.s);
    setVal(hsv.v);
    setNameText(findNearestColorName(r, g, b));
  }

  function handleHexChange(text: string) {
    setHexText(text);
    const rgb = hexToRgb(text);
    if (rgb) updateAll(rgb.r, rgb.g, rgb.b);
  }

  function handleNameChange(text: string) {
    setNameText(text);
    const hex = NAMED_COLOR_MAP[normalizeName(text)];
    if (hex) {
      const rgb = hexToRgb(hex)!;
      updateAll(rgb.r, rgb.g, rgb.b);
    }
  }

  function processSquareTouch(pageX: number, pageY: number) {
    squareRef.current?.measure((_x, _y, width, height, pageXOffset, pageYOffset) => {
      const x = pageX - pageXOffset;
      const y = pageY - pageYOffset;
      const cx = clamp(x, 0, width || SQUARE_SIZE);
      const cy = clamp(y, 0, height || SQUARE_SIZE);
      const s = cx / SQUARE_SIZE;
      const v = 1 - cy / SQUARE_SIZE;
      const rgb = hsvToRgb(hue, s, v);
      updateAll(rgb.r, rgb.g, rgb.b);
    });
  }

  function processHueTouch(pageX: number) {
    hueRef.current?.measure((_x, _y, width, _height, pageXOffset) => {
      const x = pageX - pageXOffset;
      const cx = clamp(x, 0, width || HUE_WIDTH);
      const h = (cx / HUE_WIDTH) * 360;
      const rgb = hsvToRgb(h, sat, val);
      updateAll(rgb.r, rgb.g, rgb.b);
    });
  }

  const squarePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        setScrollEnabled(false);
        processSquareTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        processSquareTouch(evt.nativeEvent.pageX, evt.nativeEvent.pageY);
      },
      onPanResponderRelease: () => setScrollEnabled(true),
      onPanResponderTerminate: () => setScrollEnabled(true),
    })
  ).current;

  const huePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        setScrollEnabled(false);
        processHueTouch(evt.nativeEvent.pageX);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        processHueTouch(evt.nativeEvent.pageX);
      },
      onPanResponderRelease: () => setScrollEnabled(true),
      onPanResponderTerminate: () => setScrollEnabled(true),
    })
  ).current;

  const hueColorRgb = hsvToRgb(hue, 1, 1);
  const hueColorHex = rgbToHex(hueColorRgb.r, hueColorRgb.g, hueColorRgb.b);

  const pointerLeft = sat * SQUARE_SIZE - POINTER_SIZE / 2;
  const pointerTop = (1 - val) * SQUARE_SIZE - POINTER_SIZE / 2;
  const huePointerLeft = (hue / 360) * HUE_WIDTH - 3;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        contentContainerStyle={styles.container}
      >
        <Text style={styles.title}>Color Picker</Text>

        <View style={[styles.swatch, { backgroundColor: hexText }]} />

        <Text style={styles.label}>Hex value</Text>
        <TextInput
          style={styles.input}
          value={hexText}
          onChangeText={handleHexChange}
          placeholder="#RRGGBB"
          autoCapitalize="characters"
          autoCorrect={false}
          maxLength={7}
        />

        <Text style={styles.label}>Color name</Text>
        <TextInput
          style={styles.input}
          value={nameText}
          onChangeText={handleNameChange}
          placeholder="e.g. royal blue"
          autoCapitalize="words"
          autoCorrect={false}
        />

        <Text style={styles.label}>Spectrum</Text>
        <View
          ref={squareRef}
          style={styles.square}
          {...squarePanResponder.panHandlers}
        >
          <LinearGradient
            colors={['#FFFFFF', hueColorHex]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['transparent', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[
              styles.pointer,
              { left: pointerLeft, top: pointerTop, backgroundColor: hexText },
            ]}
          />
        </View>

        <View
          ref={hueRef}
          style={styles.hueBar}
          {...huePanResponder.panHandlers}
        >
          <LinearGradient
            colors={[
              '#FF0000',
              '#FFFF00',
              '#00FF00',
              '#00FFFF',
              '#0000FF',
              '#FF00FF',
              '#FF0000',
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            pointerEvents="none"
            style={[styles.huePointer, { left: huePointerLeft }]}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  swatch: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 20,
  },
  label: { alignSelf: 'flex-start', marginTop: 8, marginBottom: 4, fontWeight: '600' },
  input: {
    width: SQUARE_SIZE,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    marginBottom: 8,
  },
  square: {
    width: SQUARE_SIZE,
    height: SQUARE_SIZE,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  pointer: {
    position: 'absolute',
    width: POINTER_SIZE,
    height: POINTER_SIZE,
    borderRadius: POINTER_SIZE / 2,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 2,
    elevation: 3,
  },
  hueBar: {
    width: HUE_WIDTH,
    height: HUE_HEIGHT,
    borderRadius: 6,
    overflow: 'hidden',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  huePointer: {
    position: 'absolute',
    top: -2,
    width: 6,
    height: HUE_HEIGHT + 4,
    borderRadius: 3,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#333',
  },
});