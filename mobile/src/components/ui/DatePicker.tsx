import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, Modal } from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Calendar } from 'lucide-react-native';
import { useI18n } from '@/i18n/I18nProvider';

interface DatePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
  compact?: boolean;
  monthOnly?: boolean;
}

export function DatePicker({ value, onChange, label, compact = false, monthOnly = false }: DatePickerProps) {
  const [show, setShow] = useState(false);
  const { language, translateLegacy } = useI18n();

  const handleChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShow(false);
    if (selectedDate) {
      if (monthOnly) {
        const ny = selectedDate.getFullYear();
        const nm = selectedDate.getMonth();
        onChange(new Date(ny, nm, 1));
      } else {
        onChange(selectedDate);
      }
    }
  };

  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, '0');
  const d = String(value.getDate()).padStart(2, '0');

  const MONTHS = language === 'vi'
    ? ["tháng 1", "tháng 2", "tháng 3", "tháng 4", "tháng 5", "tháng 6", "tháng 7", "tháng 8", "tháng 9", "tháng 10", "tháng 11", "tháng 12"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const formatted = monthOnly ? `${MONTHS[value.getMonth()]} ${y}` : `${y}-${m}-${d}`;

  if (Platform.OS === 'web') {
    return (
      <View style={{ flex: 1 }}>
        {label && (
          <Text style={compact
            ? { fontSize: 11, color: '#94a3b8', marginBottom: 4 }
            : { marginBottom: 6, fontSize: 12, fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1 }
          }>
            {translateLegacy(label)}
          </Text>
        )}
        <input
          type="date"
          value={formatted}
          onChange={(e: any) => {
            const parsed = new Date(e.target.value + "T00:00:00");
            if (!isNaN(parsed.getTime())) {
              if (monthOnly) {
                onChange(new Date(parsed.getFullYear(), parsed.getMonth(), 1));
              } else {
                onChange(new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate()));
              }
            }
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
          {translateLegacy(label)}
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
                <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{translateLegacy('Confirm')}</Text>
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
