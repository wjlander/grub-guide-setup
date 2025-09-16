# 📱 Android APK Build Instructions for UK Meal Planner

This guide will walk you through creating an Android APK file for the UK Meal Planner app using Android Studio and Capacitor.

## 📋 Prerequisites

Before starting, ensure you have:
- A computer with at least 8GB RAM (16GB recommended)
- 50GB+ free disk space
- Stable internet connection
- The meal planner project files

## 🔧 Step 1: Install Required Software

### 1.1 Install Node.js
- Download from [nodejs.org](https://nodejs.org/)
- Install the LTS version (20.x or later)
- Verify installation:
  ```bash
  node --version
  npm --version
  ```

### 1.2 Install Android Studio
- Download from [developer.android.com/studio](https://developer.android.com/studio)
- Run the installer and follow the setup wizard
- When prompted, install:
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device

### 1.3 Install Java Development Kit (JDK)
- Android Studio usually includes this
- If needed, install JDK 11 or later from [Oracle](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://openjdk.java.net/)

## 🛠️ Step 2: Setup Android Studio

### 2.1 Configure SDK
1. Open Android Studio
2. Go to **File → Settings** (or **Android Studio → Preferences** on Mac)
3. Navigate to **Appearance & Behavior → System Settings → Android SDK**
4. In **SDK Platforms** tab, install:
   - Android 13 (API 33) - Recommended
   - Android 12 (API 32)
   - Android 11 (API 30)
5. In **SDK Tools** tab, ensure these are installed:
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
   - Android SDK Platform-Tools
   - Android Emulator
   - Intel x86 Emulator Accelerator (if using Intel CPU)

### 2.2 Setup Environment Variables
Add these to your system PATH:

**Windows:**
```bash
# Add to System Environment Variables
ANDROID_HOME=C:\Users\[USERNAME]\AppData\Local\Android\Sdk
ANDROID_SDK_ROOT=C:\Users\[USERNAME]\AppData\Local\Android\Sdk

# Add to PATH
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\tools\bin
```

**macOS/Linux:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk  # macOS
export ANDROID_HOME=$HOME/Android/Sdk          # Linux
export ANDROID_SDK_ROOT=$ANDROID_HOME
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### 2.3 Verify Android Setup
```bash
# Check if Android SDK is accessible
adb --version
```

## 📱 Step 3: Prepare the Project

### 3.1 Get Project Files
```bash
# If you have the project repository
git clone <your-meal-planner-repo>
cd meal-planner

# Or upload the project files to your development machine
```

### 3.2 Install Dependencies
```bash
npm install
```

### 3.3 Install Capacitor CLI
```bash
npm install -g @capacitor/cli
```

### 3.4 Build the Web App
```bash
npm run build
```

## 📱 Step 4: Setup Capacitor for Android

### 4.1 Initialize Capacitor (if not already done)
```bash
# Only if capacitor.config.json doesn't exist
npx cap init
```

### 4.2 Add Android Platform
```bash
npx cap add android
```

### 4.3 Sync Project
```bash
npx cap sync android
```

## 🔨 Step 5: Configure Android Project

### 5.1 Open in Android Studio
```bash
npx cap open android
```

This will open the Android project in Android Studio.

### 5.2 Configure App Details
1. In Android Studio, open `android/app/src/main/AndroidManifest.xml`
2. Update app details if needed:
   ```xml
   <application
       android:label="UK Meal Planner"
       android:icon="@mipmap/ic_launcher"
       android:theme="@style/AppTheme">
   ```

### 5.3 Configure App Icon
1. Right-click `app/src/main/res` in the project navigator
2. Select **New → Image Asset**
3. Choose **Launcher Icons (Adaptive and Legacy)**
4. Upload your app icon (512x512 PNG recommended)
5. Click **Next** and **Finish**

### 5.4 Configure App Signing (for Release)
1. In Android Studio, go to **Build → Generate Signed Bundle / APK**
2. Select **APK** and click **Next**
3. Click **Create new...** to create a new keystore:
   - **Key store path**: Choose location (save this file safely!)
   - **Password**: Create strong password (save this!)
   - **Key alias**: e.g., "meal-planner-key"
   - **Key password**: Create strong password (save this!)
   - **Validity**: 25 years
   - **Certificate info**: Fill in your details
4. Click **OK** and **Next**

## 🏗️ Step 6: Build the APK

### 6.1 Debug Build (for testing)
```bash
# In the project root directory
npx cap copy android
npx cap sync android

# Open Android Studio
npx cap open android
```

In Android Studio:
1. Go to **Build → Build Bundle(s) / APK(s) → Build APK(s)**
2. Wait for build to complete
3. APK will be in `android/app/build/outputs/apk/debug/`

### 6.2 Release Build (for distribution)

#### Method 1: Using Android Studio
1. Go to **Build → Generate Signed Bundle / APK**
2. Select **APK** and click **Next**
3. Select your keystore file and enter passwords
4. Choose **release** build variant
5. Check both signature versions (V1 and V2)
6. Click **Finish**

#### Method 2: Using Command Line
```bash
# First, create gradle.properties file
cd android
echo "android.useAndroidX=true" > gradle.properties
echo "android.enableJetifier=true" >> gradle.properties

# Build release APK
./gradlew assembleRelease

# Sign the APK (if not auto-signed)
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 \
  -keystore /path/to/your/keystore.jks \
  app/build/outputs/apk/release/app-release-unsigned.apk \
  your-key-alias

# Align the APK
zipalign -v 4 app/build/outputs/apk/release/app-release-unsigned.apk \
  app/build/outputs/apk/release/meal-planner-release.apk
```

## 📦 Step 7: Locate and Test Your APK

### 7.1 Find Your APK
The built APK will be located at:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

### 7.2 Install on Device
```bash
# Enable USB debugging on your Android device
# Connect device via USB

# Install APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Or copy APK to device and install manually
```

### 7.3 Test the App
1. Install APK on test device
2. Test all major features:
   - Meal planning
   - Recipe management
   - Shopping lists
   - Photo upload
   - Barcode scanning
   - Dark/light mode toggle

## 🔧 Troubleshooting Common Issues

### Issue: "SDK location not found"
**Solution:**
```bash
# Create local.properties file in android folder
echo "sdk.dir=/path/to/Android/Sdk" > android/local.properties
```

### Issue: "Gradle build failed"
**Solution:**
```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew build
```

### Issue: "Certificate fingerprint mismatch"
**Solution:**
- Use the same keystore for all builds
- Check keystore passwords are correct

### Issue: App crashes on startup
**Solution:**
1. Check Android Studio logcat for errors
2. Ensure all Capacitor plugins are properly synced:
   ```bash
   npx cap sync android
   ```

### Issue: Camera/permissions not working
**Solution:**
1. Check `android/app/src/main/AndroidManifest.xml` has required permissions:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
   <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
   ```

## 📤 Step 8: Distribution Options

### 8.1 Direct Installation
- Share APK file directly
- Users need to enable "Install from unknown sources"

### 8.2 Google Play Store
1. Create Google Play Console account ($25 one-time fee)
2. Follow Play Store guidelines
3. Upload signed APK or App Bundle
4. Complete store listing
5. Submit for review

### 8.3 Alternative App Stores
- Amazon Appstore
- F-Droid (for open source apps)
- Samsung Galaxy Store

## 🔐 Security Checklist

- [ ] Use signed release builds for distribution
- [ ] Store keystore file securely (backup safely!)
- [ ] Don't commit keystore or passwords to version control
- [ ] Test APK on multiple devices and Android versions
- [ ] Verify all app permissions are necessary
- [ ] Check for sensitive data exposure
- [ ] Test offline functionality

## 📋 Build Summary

After following these steps, you should have:
1. ✅ Android Studio properly configured
2. ✅ Project set up with Capacitor
3. ✅ Signed APK file ready for distribution
4. ✅ App tested on Android device

**Final APK location**: `android/app/build/outputs/apk/release/app-release.apk`

## 📞 Need Help?

If you encounter issues:
1. Check [Capacitor Android Documentation](https://capacitorjs.com/docs/android)
2. Review [Android Developer Guides](https://developer.android.com/guide)
3. Check project's GitHub issues or discussions
4. Ensure all dependencies are up to date:
   ```bash
   npm update
   npx cap sync android
   ```

🎉 **Congratulations!** You now have a working Android APK of the UK Meal Planner app!