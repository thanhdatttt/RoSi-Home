import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  compact?: boolean;
}

export function DatePicker({ value, onChange, label, compact = false }: DatePickerProps) {
  const [show, setShow] = useState(false);

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selectedDate) onChange(selectedDate);
  };

  const formatted = value.toISOString().slice(0, 10);

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        {label && (
          <Text style={compact 
            ? { fontSize: 11, color: '#94a3b8', marginBottom: 4 } 
            : { marginBottom: 6, fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }
          }>
            {label}
          </Text>
        )}
        <input
          type="date"
          value={formatted}
          onChange={(e: any) => {
            const parsed = new Date(e.target.value);
            if (!isNaN(parsed.getTime())) onChange(parsed);
          }}
          style={compact 
            ? { width: '100%', height: 40, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 8, paddingRight: 8, fontSize: 14, outline: 'none' }
            : { width: '100%', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingLeft: 16, paddingRight: 16, fontSize: 14, fontWeight: '500', outline: 'none' }
          }
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {label && (
        <Text style={compact 
          ? { fontSize: 11, color: '#94a3b8', marginBottom: 4 } 
          : { marginBottom: 6, fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }
        }>
          {label}
        </Text>
      )}
      
      <TouchableOpacity 
        onPress={() => setShow(true)}
        style={compact 
          ? { width: '100%', height: 40, borderRadius: 8, backgroundColor: '#f5f8ff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 8, justifyContent: 'center' }
          : { width: '100%', height: 48, borderRadius: 12, backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }
        }
      >
        <Text style={compact ? { fontSize: 14 } : { fontSize: 14, fontWeight: '500' }}>
          {formatted}
        </Text>
        {!compact && <Calendar size={18} color="gray" />}
      </TouchableOpacity>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="fade">
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShow(false)} />
            <View style={{ backgroundColor: 'white', marginHorizontal: 20, borderRadius: 24, padding: 8, paddingBottom: 16, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }}>
              <DateTimePicker
                value={value}
                mode="date"
                display="inline"
                onChange={handleChange}
                accentColor="#2563eb"
              />
              <TouchableOpacity onPress={() => setShow(false)} style={{ marginTop: 8, marginHorizontal: 8, height: 48, backgroundColor: '#2563eb', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Confirm</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => setShow(false)} />
          </View>
        </Modal>
      ) : (
        show && (
          <DateTimePicker
            value={value}
            mode="date"
            display="default"
            onChange={handleChange}
          />
        )
      )}
    </View>
  );
}
