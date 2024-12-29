import React, { useEffect, useState } from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import {
    ActivityIndicator,
    Button,
    Card,
    Dialog,
    Portal,
    Provider as PaperProvider,
    Text,
    TextInput
} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import API_URL from '@/config/config';
import { ThemedView } from '@/components/ThemedView';
import { useTodos } from '@/context/TodoContext';

type Todo = {
    _id: string;
    title: string;
    description: string;
};

const TodoDetailScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const { updateTodo } = useTodos();
    const [todo, setTodo] = useState<Todo | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        fetchTodo();
    }, [id]);

    const fetchTodo = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.get<{ data: Todo }>(`${API_URL}/api/todos/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const fetchedTodo = response.data.data;
            setTodo(fetchedTodo);
            setTitle(fetchedTodo.title);
            setDescription(fetchedTodo.description);
        } catch (error) {
            console.error('Failed to fetch todo', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTodo = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const response = await axios.put<{ data: Todo }>(
                `${API_URL}/api/todos/${id}`,
                { title, description },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            const updatedTodo = response.data.data;
            setTodo(updatedTodo);
            updateTodo(updatedTodo);
            setVisible(true);
        } catch (error) {
            console.error('Failed to update todo', error);
        }
    };

    const hideDialog = () => {
        setVisible(false);
        router.back();
    };

    if (loading) {
        return (
            <PaperProvider>
                <ThemedView style={styles.container}>
                    <ActivityIndicator style={styles.loading} animating={true} />
                </ThemedView>
            </PaperProvider>
        );
    }

    if (!todo) {
        return null;
    }

    return (
        <PaperProvider>
            <Stack.Screen options={{ title: 'Todo Detail' }} />
            <ThemedView style={styles.container}>
                {/* Background */}
                <View style={styles.background} />

                <ScrollView contentContainerStyle={styles.contentContainer}>
                    <Card style={styles.card} elevation={3}>
                        <Card.Content>
                            <TextInput
                                label="Title"
                                value={title}
                                onChangeText={setTitle}
                                style={styles.input}
                                mode="outlined"
                            />
                            <TextInput
                                label="Description"
                                value={description}
                                onChangeText={setDescription}
                                style={styles.input}
                                mode="outlined"
                                multiline
                            />
                            <Button
                                mode="contained"
                                onPress={handleUpdateTodo}
                                style={styles.updateButton}
                                labelStyle={styles.updateButtonText}
                            >
                                Update Todo
                            </Button>
                        </Card.Content>
                    </Card>
                </ScrollView>
                <Portal>
                    <Dialog visible={visible} onDismiss={hideDialog}>
                        <Dialog.Title>Success</Dialog.Title>
                        <Dialog.Content>
                            <Text>Todo updated successfully</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={hideDialog}>OK</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </ThemedView>
        </PaperProvider>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "rgba(92, 92, 92, 0.4)", // Warna latar belakang gelap
    },
    background: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)", // Warna gradien statis
    },
    contentContainer: {
        paddingBottom: 80,
    },
    card: {
        marginBottom: 16,
        borderRadius: 12,
        backgroundColor: "rgb(0, 0, 0)", // Warna latar belakang kartu
        padding: 16,
    },
    input: {
        backgroundColor: "rgba(44, 44, 44, 0.4)", 
        color: "#ffffff", // Teks input berwarna putih
        marginBottom: 12,
    },
    updateButton: {
        marginTop: 12,
        backgroundColor: "rgba(255, 111, 111, 0.4)", 
        borderRadius: 8,
    },
    updateButtonText: {
        color: "#000000", // Mengubah warna teks tombol menjadi hitam
        fontWeight: "bold",
    },
    loading: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#ffffff", // Warna teks putih
        textAlign: "center",
        marginBottom: 24,
    },
});

export default TodoDetailScreen;
