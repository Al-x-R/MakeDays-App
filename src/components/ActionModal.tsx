import React from 'react';
import { View, Text, StyleSheet, Modal, Pressable, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTranslation } from 'react-i18next';
import colors from '../constants/colors';

interface ActionModalProps {
  visible: boolean;
  title: string;
  message: string;
  colorGradient: readonly [string, string, ...string[]];
  onClose: () => void;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

export const ActionModal = ({
  visible,
  title,
  message,
  colorGradient,
  onClose,
  onConfirm,
  confirmText,
  cancelText,
}: ActionModalProps) => {
  const { t } = useTranslation();

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.message}>{message}</Text>

          <View style={styles.buttonRow}>
            {onConfirm && (
              <TouchableOpacity onPress={onClose} activeOpacity={0.8} style={styles.cancelBtn}>
                <Text style={styles.cancelBtnText}>{cancelText || t('common.cancel', 'Отмена')}</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={onConfirm ? onConfirm : onClose}
              activeOpacity={0.8}
              style={{ flex: 1 }}
            >
              <LinearGradient colors={colorGradient} start={{x: 0, y: 0}} end={{x: 1, y: 0}} style={styles.confirmBtn}>
                <Text style={styles.confirmBtnText}>{confirmText || t('common.confirm', 'ОК')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  content: { width: '100%', backgroundColor: '#1A1A1E', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.borders.past },
  header: { borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)', paddingBottom: 16, marginBottom: 16 },
  title: { color: colors.text.primary, fontSize: 20, fontWeight: '800', textAlign: 'center' },
  message: { color: colors.text.secondary, fontSize: 15, lineHeight: 24, textAlign: 'center', marginBottom: 24 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  cancelBtnText: { color: colors.text.primary, fontSize: 16, fontWeight: '700' },
  confirmBtn: { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '800', textTransform: 'uppercase' }
});
