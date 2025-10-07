# Lottie Animations

## HeyBabe Splash Animation

The `heybabe-splash.json` file contains a placeholder Lottie animation for the splash screen.

### To replace with your custom animation:

1. **Create your Lottie animation** using After Effects with the Lottie plugin, or use a tool like:
   - [LottieFiles](https://lottiefiles.com/)
   - [Bodymovin](https://github.com/airbnb/lottie-web)

2. **Export as JSON** with these specifications:
   - Duration: ~3 seconds (90 frames at 30fps)
   - Size: 400x200px (or similar aspect ratio)
   - Format: JSON
   - Loop: No (single play)

3. **Replace the file**:
   ```bash
   # Replace the placeholder with your custom animation
   cp your-custom-heybabe-animation.json assets/animations/heybabe-splash.json
   ```

4. **Animation requirements**:
   - Should show the handwritten "HeyBabe" logo
   - Should be centered and properly sized
   - Should play once (no loop)
   - Should last approximately 3 seconds
   - Should use brand colors (#89CFF0 or similar)

### Current placeholder:
The current file contains a simple text animation that scales up the "HeyBabe" text. Replace this with your actual handwritten logo animation.

### Testing:
After replacing the file, restart the Expo development server to see the new animation:
```bash
npx expo start --clear
```
