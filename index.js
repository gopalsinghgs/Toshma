/**
 * @format
 */

import { AppRegistry } from 'react-native';
// enableScreens() must be called before any navigator is rendered.
// This activates the native RNSScreen views that back react-navigation's
// native-stack — without this call you get "Unimplemented component <RNSScreenStack>".
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

enableScreens();

AppRegistry.registerComponent(appName, () => App);
