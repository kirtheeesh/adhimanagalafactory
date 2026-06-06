import { StyleSheet, Text, View } from "react-native";
import Login from "./login";

export default function Index(){
  console.log("Rendering Index Screen");
  return(
    <View style={style.container}>
      <Login/>
      <Text style={{ position: 'absolute', bottom: 10, color: 'red' }}>Debug: Index Loaded</Text>
    </View>
  )
}
const style= StyleSheet.create({
  container: {
    flex: 1,
  },
})


