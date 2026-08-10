# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Testing push notifications (Expo push, not FCM)

The "Push" tab (`src/app/push-test.tsx`) is a minimal harness for end-to-end
testing: log in, register this device's Expo push token with the backend,
then send yourself a test notification.

Before it will work:

1. **Set your EAS project id.** In `app.json`, replace
   `expo.extra.eas.projectId` with your real EAS project id
   (`npx eas init` if you don't have one yet). Without it,
   `getExpoPushTokenAsync` cannot run.
2. **Point at your backend.** Set `expo.extra.apiUrl` in `app.json` (or the
   `EXPO_PUBLIC_API_URL` env var) to your backend's URL. If you're testing on
   a physical device, use your machine's LAN IP — not `localhost`.
3. **Use a development build, not Expo Go, on Android.** As of Expo SDK 53+,
   remote push notifications don't work in Expo Go on Android — build with
   `npx expo run:android` or an EAS development build. iOS Expo Go still
   supports push.
4. **Use a physical device.** Push tokens can't be obtained on
   simulators/emulators.

Once logged in and registered, tap "Send test notification" — it calls
`POST /api/v1/notifications/test` on the backend, which pushes to every
device token registered for your account. This same `NotificationService` is
what the lease-expiration reminder job (US-LEASE-05) uses, so this screen
also verifies that pipeline is wired correctly.

## Join the community
Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
