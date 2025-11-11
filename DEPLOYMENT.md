# iOS Deployment Setup Guide

This guide explains how to set up the CI/CD pipeline for building and deploying the iOS app to App Store Connect using GitHub Actions and Expo Application Services (EAS).

## Prerequisites

Before setting up the CI/CD pipeline, you need:

1. An Apple Developer account
2. An Expo account
3. Access to the GitHub repository with admin permissions
4. Node.js 18+ installed locally for testing

## EAS Setup

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Login to Expo

```bash
eas login
```

Enter your Expo credentials when prompted.

### 3. Configure EAS Project

The project is already configured with EAS (see `eas.json` and `app.json`). The project ID is: `7d7f7953-8094-4b5c-a9d1-66a168b21094`

If you need to reconfigure, run:

```bash
eas build:configure
```

### 4. Set Up iOS Credentials

EAS needs to manage your iOS certificates and provisioning profiles. Run:

```bash
eas credentials
```

Select iOS and follow the prompts to:
- Set up Distribution Certificate
- Set up Provisioning Profile
- Configure App Store Connect API Key (recommended)

Alternatively, EAS can automatically manage credentials for you when you run your first build.

## App Store Connect Setup

### 1. Create App Store Connect API Key

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **Users and Access** > **Keys** (under Integrations)
3. Click the **+** button to create a new key
4. Give it a name (e.g., "EAS CI/CD")
5. Select **App Manager** access or higher
6. Click **Generate**
7. Download the `.p8` key file (you can only download it once!)
8. Note the **Issuer ID** and **Key ID**

### 2. Register Your App

1. In App Store Connect, go to **My Apps**
2. Click the **+** button and select **New App**
3. Fill in the required information:
   - **Platform**: iOS
   - **Name**: Crohns Tracker
   - **Primary Language**: English
   - **Bundle ID**: `com.rorticus.crohnstracker` (must match `app.json`)
   - **SKU**: Choose a unique identifier
4. Note the **App ID** (ASC App ID) from the App Information page

### 3. Configure App Store Connect API Key in EAS

Upload the API key to EAS:

```bash
eas credentials
```

Select:
1. iOS
2. Production
3. App Store Connect API Key
4. Set up a new App Store Connect API Key

You'll need:
- The `.p8` key file you downloaded
- The Issuer ID
- The Key ID

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

### Required Secrets

Go to your GitHub repository → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

1. **EXPO_TOKEN**
   - Generate this token by running: `eas token:create` or `expo token:create`
   - This allows GitHub Actions to authenticate with Expo/EAS
   
2. **EXPO_APPLE_APP_SPECIFIC_PASSWORD** (Optional but recommended)
   - Create an app-specific password at [appleid.apple.com](https://appleid.apple.com/)
   - Sign in → Security → App-Specific Passwords → Generate
   - This is used if the workflow needs to authenticate with Apple services

### Environment Variables in eas.json

The `eas.json` file references these environment variables for submission:

- `APPLE_ID`: Your Apple ID email
- `ASC_APP_ID`: The App Store Connect App ID (numeric ID from App Information page)
- `APPLE_TEAM_ID`: Your Apple Developer Team ID (found in App Store Connect → Membership)

These can be set as GitHub secrets and referenced in the workflow, or configured directly in EAS:

```bash
eas secret:create --scope project --name APPLE_ID --value "your-apple-id@example.com"
eas secret:create --scope project --name ASC_APP_ID --value "1234567890"
eas secret:create --scope project --name APPLE_TEAM_ID --value "ABCDE12345"
```

## Testing the Setup Locally

Before relying on CI/CD, test the build locally:

### 1. Test Production Build

```bash
eas build --platform ios --profile production
```

This will:
- Build your app in the cloud
- Return a build URL when complete
- Take 10-30 minutes

### 2. Test Submission

After a successful build:

```bash
eas submit --platform ios --latest
```

This will upload the latest build to App Store Connect.

## GitHub Actions Workflow

The workflow is defined in `.github/workflows/build-and-deploy-ios.yml` and runs on:

- Push to `main` branch
- Manual trigger via `workflow_dispatch`

### Workflow Steps

1. **Checkout repository**: Gets the latest code
2. **Setup Node.js**: Installs Node.js 18
3. **Install dependencies**: Runs `npm ci`
4. **Setup Expo and EAS**: Configures EAS CLI
5. **Build iOS app**: Triggers EAS build with production profile
6. **Wait for build**: Polls EAS until build completes
7. **Download IPA**: Downloads the built .ipa file
8. **Upload to App Store Connect**: Submits the app using `eas submit`
9. **Upload artifact**: Saves the .ipa file as a GitHub artifact

### Viewing Build Status

- Check the **Actions** tab in your GitHub repository
- Each workflow run shows the build progress and logs
- The .ipa file is available as a downloadable artifact for 30 days

## Troubleshooting

### Common Issues

1. **Build fails with "No credentials found"**
   - Run `eas credentials` locally and ensure credentials are set up
   - Check that `EXPO_TOKEN` is correctly set in GitHub Secrets

2. **Submission fails with authentication error**
   - Verify App Store Connect API Key is properly configured in EAS
   - Check that the `APPLE_ID`, `ASC_APP_ID`, and `APPLE_TEAM_ID` secrets are set

3. **Build times out**
   - EAS builds can take 15-30 minutes
   - The workflow includes a 60-second polling interval
   - Check build logs in EAS dashboard: https://expo.dev/accounts/[your-account]/projects/crohns-tracker/builds

4. **Bundle identifier mismatch**
   - Ensure `app.json` has the correct bundle ID: `com.rorticus.crohnstracker`
   - This must match the App Store Connect app configuration

### Useful Commands

Check EAS build status:
```bash
eas build:list --platform ios
```

View build details:
```bash
eas build:view [BUILD_ID]
```

Check EAS project credentials:
```bash
eas credentials
```

View EAS secrets:
```bash
eas secret:list
```

## Additional Resources

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [EAS Submit Documentation](https://docs.expo.dev/submit/introduction/)
- [App Store Connect API](https://developer.apple.com/app-store-connect/api/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Application Services](https://expo.dev/eas)

## Security Notes

- Never commit API keys, certificates, or passwords to the repository
- All sensitive credentials should be stored as GitHub Secrets or EAS Secrets
- The workflow uses `EXPO_TOKEN` for authentication, which should be treated as a sensitive credential
- Regularly rotate your App Store Connect API keys and Expo tokens
- Use the principle of least privilege when assigning API key permissions
