# 🚀 Quick Start: Using Scribble Components

## Import Components

```tsx
import {
  ScribbleText,
  ScribbleHeading,
  ScribbleCard,
  ScribbleButton,
  ScribbleBorder,
} from '@/components/scribble';
```

## Text Examples

```tsx
// Small muted label
<ScribbleText size="xs" color={theme.colors.text.muted}>
  LABEL
</ScribbleText>

// Regular paragraph
<ScribbleText size="base">
  This is regular text in comic font
</ScribbleText>

// Large heading
<ScribbleText size="xxl" weight="bold">
  Big Title
</ScribbleText>

// Or use ScribbleHeading
<ScribbleHeading level={1}>
  Heading 1
</ScribbleHeading>

<ScribbleHeading level={2}>
  Heading 2
</ScribbleHeading>
```

## Card Examples

```tsx
// Simple card with scribble border
<Card variant="elevated" scribble={true}>
  <ScribbleText>Content</ScribbleText>
</Card>

// Advanced card with animation
<ScribbleCard variant="elevated" animate={true}>
  <ScribbleHeading level={3}>Card Title</ScribbleHeading>
  <ScribbleText>Card content goes here</ScribbleText>
</ScribbleCard>
```

## Button Examples

```tsx
// Primary button
<ScribbleButton
  onPress={() => console.log('Clicked!')}
  variant="primary"
  size="md"
>
  Click Me
</ScribbleButton>

// Outline button
<ScribbleButton
  onPress={handleAction}
  variant="outline"
  size="sm"
>
  Secondary Action
</ScribbleButton>

// Large secondary button
<ScribbleButton
  onPress={handleSubmit}
  variant="secondary"
  size="lg"
>
  Submit Form
</ScribbleButton>
```

## Color Palette Quick Reference

```tsx
import { useTheme } from '@/hooks/useTheme';

const theme = useTheme();

// Backgrounds
theme.colors.background.primary    // #FFF8E7 (cream)
theme.colors.background.secondary  // #FFE5D9 (peach)
theme.colors.background.elevated   // #FFFBF5 (light cream)

// Accents
theme.colors.accent.primary        // #FF6B9D (pink)
theme.colors.accent.secondary      // #4ECDC4 (teal)
theme.colors.accent.yellow         // #FFD93D (yellow)
theme.colors.accent.orange         // #FF8B6A (coral)
theme.colors.accent.blue           // #6BCF7F (seafoam)

// Text
theme.colors.text.primary          // #2D4059 (dark blue-gray)
theme.colors.text.secondary        // #5F6F81 (medium blue-gray)
theme.colors.text.tertiary         // #8B95A5 (light blue-gray)
theme.colors.text.muted            // #A8B4C3 (soft gray)
```

## Common Patterns

### Card Header
```tsx
<CardHeader>
  <ScribbleText size="xs" weight="bold" color={theme.colors.text.muted}>
    SECTION TITLE
  </ScribbleText>
  <ScribbleText size="xxl" weight="regular">
    Main Heading
  </ScribbleText>
</CardHeader>
```

### Data Display
```tsx
<View style={styles.dataRow}>
  <ScribbleText size="sm" color={theme.colors.text.tertiary}>
    Label:
  </ScribbleText>
  <ScribbleText size="base" weight="bold" color={theme.colors.text.primary}>
    Value
  </ScribbleText>
</View>
```

### Alert/Notice
```tsx
<View style={{ backgroundColor: theme.colors.accent.yellow, padding: 16, borderRadius: 12 }}>
  <ScribbleText size="sm" color={theme.colors.text.primary}>
    ⚠️ Important notice here
  </ScribbleText>
</View>
```

## Converting Existing Components

### Step 1: Replace Text
```tsx
// Find all <Text> components
// Replace with <ScribbleText>

// Before:
<Text style={{ fontSize: 16 }}>Hello</Text>

// After:
<ScribbleText size="base">Hello</ScribbleText>
```

### Step 2: Update Cards
```tsx
// Add scribble prop to existing Cards
<Card variant="elevated" scribble={true}>
```

### Step 3: Replace Buttons
```tsx
// Before:
<TouchableOpacity onPress={handlePress}>
  <Text>Click</Text>
</TouchableOpacity>

// After:
<ScribbleButton onPress={handlePress} variant="primary">
  Click
</ScribbleButton>
```

## Font Sizes

- `xs` - 12px (labels, captions)
- `sm` - 14px (secondary text)
- `base` - 16px (body text)
- `lg` - 20px (section headers)
- `xl` - 24px (page titles)
- `xxl` - 32px (main headings)
- `xxxl` - 40px (hero text)

## Font Weights

- `light` - 300
- `regular` - 400 (default)
- `bold` - 700

## Tips

1. **Always use ScribbleText** instead of Text for consistent fonts
2. **Enable scribble borders** on cards for the full effect
3. **Use pastel accent colors** for visual interest
4. **Leverage the theme** - don't hardcode colors
5. **Test in both light and dark mode** - both are supported

## Testing

Run your app to see the transformation:

```bash
npm run ios
# or
npm run android
# or
npm start
```

The fonts will load automatically, showing a loading spinner until ready.

---

**That's it! You're ready to create beautiful cartoon/comic UI!** 🎨
