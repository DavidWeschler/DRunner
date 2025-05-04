/**
 * This component is a custom date and time picker using react-native-modal-datetime-picker.
 * It allows users to select a date and time, and it displays a button with a calendar icon.
 */
import React, { useState } from "react";
import { View, Button, TouchableOpacity, StyleSheet } from "react-native";
import DateTimePickerModal from "react-native-modal-datetime-picker";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

interface MyDateTimePickerProps {
  alreadyChoseDate: boolean;
  onDateTimeSelected: (dateTime: Date) => void;
  testID?: string;
}

const MyDateTimePicker: React.FC<MyDateTimePickerProps> = ({ alreadyChoseDate, onDateTimeSelected }) => {
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);

  const handleConfirm = (date: Date) => {
    onDateTimeSelected(date);
    hideDatePicker();
  };

  return (
    <View testID="my-datetime-picker">
      <TouchableOpacity testID="date-picker-button" style={styles.button} onPress={showDatePicker}>
        <MaterialIcons name="schedule" size={24} color={alreadyChoseDate ? "#C0C0C0" : "#009900"} />
      </TouchableOpacity>
      {!alreadyChoseDate && <DateTimePickerModal testID="datetime-picker" isVisible={isDatePickerVisible} mode="datetime" onConfirm={handleConfirm} onCancel={hideDatePicker} />}
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
