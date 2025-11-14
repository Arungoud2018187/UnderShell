import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type Relation = 'father' | 'mother' | 'brother' | 'other';

interface Contact { 
  relation: Relation;
  name: string;
  phone: string;
}
const relations: Relation[] = ['father', 'mother', 'brother', 'other'];
const STORAGE_KEY = 'saviours_contacts';

export default function SavioursScreen() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<Contact>({
    relation: relations[0],
    name: '',
    phone: '',
  });
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingIdx, setEditingIdx] = useState<number | null>(null);

  // Load contacts from storage
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) {
        const saved = JSON.parse(data);
        setContacts(saved);
        if (saved.length < relations.length) {
          setStep(saved.length);
          setInput({ relation: relations[saved.length], name: '', phone: '' });
        } else {
          setStep(relations.length);
        }
      }
    });
  }, []);

  // Save contacts to storage
  useEffect(() => {
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
  }, [contacts]);

  const handleSubmit = () => {
    if (editingIdx !== null) {
      // Edit mode
      const updated = [...contacts];
      updated[editingIdx] = input;
      setContacts(updated);
      setEditingIdx(null);
      setInput({ relation: relations[step], name: '', phone: '' });
    } else {
      // Add mode
      setContacts(prev => [...prev, input]);
      if (step < relations.length - 1) {
        setStep(step + 1);
        setInput({ relation: relations[step + 1], name: '', phone: '' });
      } else {
        setStep(relations.length);
      }
    }
  };

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setInput(contacts[idx]);
    setStep(idx);
  };

  const handleDelete = (idx: number) => {
    const updated = contacts.filter((_, i) => i !== idx);
    setContacts(updated);
    // If all contacts are deleted, reset to first step
    if (updated.length < relations.length) {
      setStep(updated.length);
      setInput({ relation: relations[updated.length], name: '', phone: '' });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Saviours</Text>
      {step < relations.length ? (
        <View style={styles.form}>
          <Text style={styles.label}>Relation</Text>
          <Text style={styles.relation}>{input.relation.charAt(0).toUpperCase() + input.relation.slice(1)}</Text>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor="#aaa"
            value={input.name}
            onChangeText={text => setInput({ ...input, name: text })}
          />
          <TextInput
            style={styles.input}
            placeholder="Contact Number"
            placeholderTextColor="#aaa"
            keyboardType="phone-pad"
            value={input.phone}
            onChangeText={text => setInput({ ...input, phone: text })}
          />
          <TouchableOpacity
            style={[
              styles.button,
              (!input.name || !input.phone) && styles.buttonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={!input.name || !input.phone}
          >
            <Text style={styles.buttonText}>{editingIdx !== null ? 'Update' : 'Save'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>Saved Contacts</Text>
          {contacts.map((c, idx) => (
            <View key={idx} style={styles.savedContact}>
              <Text style={styles.savedText}>
                {c.relation.charAt(0).toUpperCase() + c.relation.slice(1)}: {c.name} ({c.phone})
              </Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => handleEdit(idx)}>
                <Text style={styles.editText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(idx)}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#181818',
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Cursive',
    marginBottom: 30,
    marginTop: 20,
  },
  form: {
    width: '100%',
    alignItems: 'center',
  },
  label: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Cursive',
    marginBottom: 8,
  },
  relation: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'Cursive',
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#222',
    color: '#fff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: 'Cursive',
    width: '100%',
  },
  button: {
    backgroundColor: '#3949ab',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Cursive',
    fontWeight: 'bold',
  },
  summary: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  summaryTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Cursive',
    marginBottom: 16,
  },
  savedContact: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  savedText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Cursive',
    marginRight: 12,
  },
  editBtn: {
    backgroundColor: '#3949ab',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  editText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Cursive',
  },
  deleteBtn: {
    backgroundColor: '#e53935',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  deleteText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Cursive',
  },
});