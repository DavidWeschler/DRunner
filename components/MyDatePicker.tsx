import React, { useState } from "react";
import { View, Button, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface MyDateTimePickerProps {
  alreadyChoseDate: boolean;
  onDateTimeSelected: (dateTime: Date) => void; // Callback function
}

const MyDateTimePicker: React.FC<MyDateTimePickerProps> = ({ alreadyChoseDate, onDateTimeSelected }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    onDateTimeSelected(date); // Send date back to parent
    hideDatePicker(); // Close picker
  };

  return (
    <View>
      <TouchableOpacity style={styles.button} onPress={showDatePicker}>
        <MaterialIcons name="schedule" size={24} color={alreadyChoseDate ? "#C0C0C0" : "#009900"} />
      </TouchableOpacity>
      {!alreadyChoseDate && <DateTimePickerModal isVisible={isDatePickerVisible} mode="datetime" onConfirm={handleConfirm} onCancel={hideDatePicker} />}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
  },
});

export default MyDateTimePicker;
