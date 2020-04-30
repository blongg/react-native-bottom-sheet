# react-native-bottom-sheet  
Simple and fast bottom sheet for react-native. Built with **react-native-reanimated** and **react-native-gesture-handler**.  

**This library is compatible with Expo.**
  
## Installation  
`npm install @vaicar/react-native-bottom-sheet`  
  
If you are not using Expo, make sure to install [react-native-reanimated](https://www.npmjs.com/package/react-native-reanimated) and [react-native-gesture-handler](https://www.npmjs.com/package/react-native-gesture-handler)  .
  
## Setup
If you want the bottom sheet to be in front of everything (like header, bottom tabs, etc), you will have to wrap your root navigation component with the BottomSheetPortalHost component, like that:  
```js  
import { BottomSheetPortalHost } from '@vaicar/react-native-bottom-sheet';  
<BottomSheetPortalHost>  
   <Navigation ... />  
</BottomSheetPortalHost>  
```
## Usage  
```js  
import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import BottomSheet from '@vaicar/react-native-bottom-sheet';

export default class MyComponent extends React.Component {

  constructor(props) {
    super(props);
    this.bottomSheetRef = React.createRef();
  }

  openBottomSheet = () => {
    this.bottomSheetRef.current.open();
  };

  closeBottomSheet = () => {
    this.bottomSheetRef.current.close();
  };

  render() {
    return (
      <View>
        <TouchableOpacity
          onPress={this.openBottomSheet}
        >
          <Text>Open bottom sheet</Text>
        </TouchableOpacity>
        <BottomSheet
          closeOnDragDown
          ref={this.bottomSheetRef}
          height={400}
          duration={200}
          onClose={() => {
            console.log('Bottom sheet closed!');
          }}
          onOpen={() => {
            console.log('Bottom sheet opened!');
          }}
        >
          <Text>Hello world!</Text>
        </BottomSheet>
      </View>
    );
  }
}
```  
  
**If you're not using BottomSheetPortalHost, make sure to set the property usePortal to false.**   

## Props
| name                      | required | default | description |
| ------------------------- | -------- | ------- | ------------|
| height                | yes      |         | Bottom sheet's height |
| duration                | no      |         | The open/close animation's duration (in ms)
| closeOnDragDown                | no      |    true     | Closes the bottom sheet on drag down | |
| closeOnPressMask                | no      |    true     | Closes the bottom sheet when the user clicks on the background mask | |
| fadeMask                | no      |    true     | fade the background when bottom sheet is opened/closed or moved | |
| onClose                | no      |    () => {}     | Called when the bottom sheet finishes the closing animation. | |
| onOpen                | no      |    () => {}     | Called when the bottom sheet finishes the opening animation. | |
| usePortal                | no      |    true     | If true, the bottom sheet will use the BottomSheetPortalHost component, to move the bottom-sheet on top of everything.  | |

## Methods
### open()
Opens the bottom-sheet. Returns a promise, that's resolved when the bottom sheet finishes the opening animation.

```js
this.bottomSheetRef.current.open().then(() => {
 // bottom sheet finished the opening animation
})
```

### close()
Closes the bottom-sheet. Returns a promise, that's resolved when the bottom sheet finishes the closing animation.

```js
this.bottomSheetRef.current.close().then(() => {
 // bottom sheet finished the closing animation
})
```

## TODO

 1. Add examples;
 2. Add tests;
 3. Improve documentation
 4. Add more props to make the component more customizable.
