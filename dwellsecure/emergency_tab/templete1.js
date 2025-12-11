import React from "react";
import { SafeAreaView, View, ScrollView, Text, Image, TouchableOpacity, } from "react-native";
export default (props) => {
	return (
		<SafeAreaView 
			style={{
				flex: 1,
				backgroundColor: "#FFFFFF",
			}}>
			<ScrollView  
				style={{
					flex: 1,
					backgroundColor: "#FFFFFF",
				}}>
				<View 
					style={{
						alignItems: "flex-end",
						marginBottom: 23,
					}}>
					<View 
						style={{
							flexDirection: "row",
							marginRight: 52,
						}}>
						<Text 
							style={{
								color: "#1E1E1E",
								fontSize: 36,
								fontWeight: "bold",
								marginTop: 75,
								marginRight: 147,
							}}>
							{"Dwell Secure"}
						</Text>
						<Image
							source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/cZraq4PYhv/50rum9oy_expires_30_days.png"}} 
							resizeMode = {"stretch"}
							style={{
								width: 100,
								height: 102,
							}}
						/>
					</View>
				</View>
				<Text 
					style={{
						color: "#8E8E93",
						fontSize: 18,
						fontWeight: "bold",
						marginBottom: 68,
						marginLeft: 62,
					}}>
					{"All your critical property data in one place"}
				</Text>
				<View 
					style={{
						alignItems: "center",
						marginBottom: 35,
					}}>
					<View 
						style={{
							alignItems: "center",
							backgroundColor: "#F2F2F7",
							borderRadius: 15,
							paddingVertical: 19,
							paddingHorizontal: 22,
						}}>
						<TouchableOpacity 
							style={{
								backgroundColor: "#D1D1D6",
								borderRadius: 20,
								paddingVertical: 43,
								paddingHorizontal: 134,
								marginBottom: 16,
							}} onPress={()=>alert('Pressed!')}>
							<Image
								source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/cZraq4PYhv/247zf37o_expires_30_days.png"}} 
								resizeMode = {"stretch"}
								style={{
									width: 159,
									height: 160,
								}}
							/>
						</TouchableOpacity>
						<View 
							style={{
								flexDirection: "row",
								alignItems: "center",
							}}>
							<Text 
								style={{
									color: "#1E1E1E",
									fontSize: 24,
									fontWeight: "bold",
									marginRight: 115,
								}}>
								{"604 7th Ave"}
							</Text>
							<View 
								style={{
									width: 40,
									height: 40,
									backgroundColor: "#D9D9D9",
									borderRadius: 10,
									marginRight: 15,
								}}>
							</View>
							<View 
								style={{
									width: 40,
									height: 40,
									backgroundColor: "#D9D9D9",
									borderRadius: 10,
									marginRight: 15,
								}}>
							</View>
							<View 
								style={{
									width: 40,
									height: 40,
									backgroundColor: "#D9D9D9",
									borderRadius: 10,
								}}>
							</View>
						</View>
					</View>
				</View>
				<View 
					style={{
						alignItems: "center",
						marginBottom: 375,
					}}>
					<TouchableOpacity 
						style={{
							borderColor: "#C7C7CC",
							borderRadius: 15,
							borderWidth: 6,
							paddingVertical: 50,
							paddingHorizontal: 201,
						}} onPress={()=>alert('Pressed!')}>
						<Image
							source = {{uri: "https://storage.googleapis.com/tagjs-prod.appspot.com/v1/cZraq4PYhv/cvtvgw8r_expires_30_days.png"}} 
							resizeMode = {"stretch"}
							style={{
								width: 70,
								height: 70,
							}}
						/>
					</TouchableOpacity>
				</View>
				<View 
					style={{
						flexDirection: "row",
						backgroundColor: "#D9D9D9",
						paddingVertical: 26,
						paddingHorizontal: 35,
					}}>
					<View 
						style={{
							height: 90,
							flex: 1,
							backgroundColor: "#AEAEB2",
							borderRadius: 30,
							marginRight: 24,
						}}>
					</View>
					<View 
						style={{
							height: 90,
							flex: 1,
							backgroundColor: "#F2F2F7",
							borderRadius: 30,
							marginRight: 24,
						}}>
					</View>
					<View 
						style={{
							height: 90,
							flex: 1,
							backgroundColor: "#F2F2F7",
							borderRadius: 30,
							marginRight: 24,
						}}>
					</View>
					<View 
						style={{
							height: 90,
							flex: 1,
							backgroundColor: "#F2F2F7",
							borderRadius: 30,
						}}>
					</View>
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}