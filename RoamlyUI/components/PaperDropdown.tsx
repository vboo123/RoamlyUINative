// components/PaperDropdown.tsx
import React, { useState } from 'react';
import { Modal, View, FlatList, TouchableOpacity } from 'react-native';
import { TextInput, List, Text } from 'react-native-paper';

interface PaperDropdownProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}

export default function PaperDropdown({ label, value, onChange, options }: PaperDropdownProps) {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TextInput
        label={label}
        mode="outlined"
        value={value}
        onFocus={() => setVisible(true)}
        showSoftInputOnFocus={false} // Prevent keyboard from showing
        right={<TextInput.Icon icon="menu-down" />}
        style={{ marginBottom: 12 }}
      />

      <Modal visible={visible} animationType="fade" transparent>
        <TouchableOpacity
          onPress={() => setVisible(false)}
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.3)' }}
          activeOpacity={1}
        >
          <View
            style={{
              backgroundColor: 'white',
              margin: 32,
              padding: 16,
              borderRadius: 8,
              elevation: 4,
            }}
          >
            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <List.Item
                  title={item.label}
                  onPress={() => {
                    onChange(item.value);
                    setVisible(false);
                  }}
                />
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
