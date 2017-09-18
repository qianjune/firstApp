import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';

const HeaderExample = () => (
  <View style={styles.header}>
    <Text style={styles.headerTitle}>
          视频列表
    </Text>
  </View>
);
export default HeaderExample;

const styles = StyleSheet.create({
  header: {
    paddingTop: 25,
    paddingBottom: 12,
    backgroundColor: '#ee735c',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
});
