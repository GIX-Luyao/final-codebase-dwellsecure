import React, { useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Image } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TUTORIAL_IMAGE_WIDTH = 195;
const TUTORIAL_IMAGE_HEIGHT = 422;

const tutorialSteps = [
  {
    id: 1,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/7a9c9ea40eb2d1c0ad3f9e7ecd35021b0b5d5ce9',
  },
  {
    id: 2,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/685c5f626fbcd9bc0b49c2167e657b3dd5b89c5d',
  },
  {
    id: 3,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/6b99b6b6e60824b47cee5e73034589f2c21f91eb',
  },
  {
    id: 4,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/a896dfaa4250b61d0a6cd48d28b4d2cdac50d1e1',
  },
  {
    id: 5,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/15bba2ab52a22419b5f71359e7802870d66fe6ab',
  },
  {
    id: 6,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/58283dd8e17191688c7cc5a3259164f6d9a68930',
  },
  {
    id: 7,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/f13076ccc0ed0502dfc06599e8fd9257eed68899',
  },
  {
    id: 8,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/08eee1aa092f10760e616a50fd42a801a8bd6892',
  },
  {
    id: 9,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/940e2cbc66d324511cf36c9b982da3431f537b57',
  },
  {
    id: 10,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/780010717bff543e168de37ca77003ad2af63704',
  },
  {
    id: 11,
    image: 'https://api.builder.io/api/v1/image/assets/TEMP/cecced42c133ff52dd342b524be0f2000dd3ccea',
  },
];

const Arrow1 = () => (
  <Svg width="23" height="25" viewBox="0 0 23 25" fill="none" style={styles.arrow1}>
    <Path
      d="M1.00024 1.00024C1.41587 1.20806 2.87045 2.29342 5.21754 4.24329C6.32414 5.21485 7.2593 6.15 9.52023 8.89129C11.7812 11.6326 15.3395 16.1517 21.205 23.0118"
      stroke="#FFCC00"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

const Arrow2 = () => (
  <Svg width="26" height="20" viewBox="0 0 26 20" fill="none" style={styles.arrow2}>
    <Path
      d="M24.2662 1C24.1607 1 24.0552 1 21.3872 2.59455C18.7192 4.18911 13.4919 7.37822 9.78483 9.97782C6.07772 12.5774 4.04916 14.4909 1 18.0367"
      stroke="#FFCC00"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </Svg>
);

export default function AddResourceTutorial() {
  const scrollViewRef = useRef(null);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Adding a New Resource</Text>
      </View>
      
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={true}
        pagingEnabled={false}
        decelerationRate="fast"
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {tutorialSteps.map((step, index) => (
          <View key={step.id} style={styles.stepContainer}>
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: step.image }}
                style={styles.tutorialImage}
                resizeMode="contain"
              />
            </View>
            {index === 0 && (
              <View style={styles.arrowsContainer}>
                <Arrow1 />
                <Arrow2 />
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>
          Swipe to see how to add a new resource to your property
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#0066cc',
    paddingVertical: 20,
    paddingHorizontal: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  stepContainer: {
    marginRight: 30,
    position: 'relative',
  },
  imageWrapper: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  tutorialImage: {
    width: TUTORIAL_IMAGE_WIDTH,
    height: TUTORIAL_IMAGE_HEIGHT,
  },
  arrowsContainer: {
    position: 'absolute',
    top: 30,
    right: -40,
  },
  arrow1: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  arrow2: {
    position: 'absolute',
    top: 3,
    left: -2,
  },
  instructionContainer: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
});
