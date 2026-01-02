import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    StatusBar,
    ActivityIndicator,
    Alert,
    Image,
    Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColors, SPACING, BORDER_RADIUS, FONT_SIZES } from '../constants/theme';
import { useTheme } from '../contexts/ThemeContext';
import listingService from '../services/listingService';
import * as ImagePicker from 'expo-image-picker';

interface EditListingScreenProps {
    route: any;
    navigation?: any;
}

const AMENITIES = [
    'WiFi', 'Washer/Dryer', 'Air Conditioning', 'Heating', 'Parking',
    'Pool', 'Gym', 'Pet Friendly', 'Furnished', 'Balcony',
    'Dishwasher', 'Utilities Included', 'Storage', 'Security System',
];

const EditListingScreen: React.FC<EditListingScreenProps> = ({ route, navigation }) => {
    const { listingId } = route.params || {};
    const colors = useColors();
    const { isDark } = useTheme();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        rent: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        bedrooms: '',
        bathrooms: '',
        squareFeet: '',
        propertyType: 'apartment',
        isActive: true,
        images: [] as string[],
        amenities: [] as string[],
    });

    useEffect(() => {
        if (listingId) {
            fetchListing();
        } else {
            setIsLoading(false);
        }
    }, [listingId]);

    const fetchListing = async () => {
        try {
            const listing = await listingService.getListing(listingId);
            setFormData({
                title: listing.title || '',
                description: listing.description || '',
                rent: String(listing.rent || ''),
                address: listing.address || '',
                city: listing.city || '',
                state: listing.state || '',
                zipCode: listing.zipCode || '',
                bedrooms: String(listing.bedrooms || ''),
                bathrooms: String(listing.bathrooms || ''),
                squareFeet: String(listing.squareFeet || ''),
                propertyType: listing.propertyType || 'apartment',
                isActive: listing.status === 'active',
                images: listing.images || [],
                amenities: listing.amenities || [],
            });
        } catch (error) {
            console.error('Error fetching listing:', error);
            Alert.alert('Error', 'Failed to load listing');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePickImage = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                const newImages = result.assets.map(asset => asset.uri);
                setFormData(prev => ({
                    ...prev,
                    images: [...prev.images, ...newImages],
                }));
            }
        } catch (error) {
            console.error('Error picking image:', error);
        }
    };

    const handleRemoveImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== index),
        }));
    };

    const toggleAmenity = (amenity: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity],
        }));
    };

    const handleSave = async () => {
        if (!formData.title || !formData.rent || !formData.address) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsSaving(true);
        try {
            const listingData = {
                ...formData,
                rent: parseFloat(formData.rent),
                bedrooms: parseInt(formData.bedrooms) || 0,
                bathrooms: parseFloat(formData.bathrooms) || 0,
                squareFeet: parseInt(formData.squareFeet) || 0,
                status: (formData.isActive ? 'active' : 'inactive') as 'active' | 'inactive',
            };

            if (listingId) {
                await listingService.updateListing(listingId, listingData);
                Alert.alert('Success', 'Listing updated successfully', [
                    { text: 'OK', onPress: () => navigation?.goBack() },
                ]);
            } else {
                await listingService.createListing(listingData);
                Alert.alert('Success', 'Listing created successfully', [
                    { text: 'OK', onPress: () => navigation?.goBack() },
                ]);
            }
        } catch (error) {
            console.error('Error saving listing:', error);
            Alert.alert('Error', 'Failed to save listing');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Delete Listing',
            'Are you sure you want to delete this listing? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await listingService.deleteListing(listingId);
                            Alert.alert('Deleted', 'Listing has been deleted', [
                                { text: 'OK', onPress: () => navigation?.goBack() },
                            ]);
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete listing');
                        }
                    },
                },
            ]
        );
    };

    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        safeArea: { backgroundColor: colors.background },
        header: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
            borderBottomWidth: 1, borderBottomColor: colors.border,
        },
        backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
        headerTitle: { fontSize: FONT_SIZES.xl, fontWeight: '700', color: colors.text },
        saveButton: {
            backgroundColor: colors.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
            borderRadius: BORDER_RADIUS.lg,
        },
        saveButtonText: { color: '#FFFFFF', fontWeight: '700', fontSize: FONT_SIZES.sm },
        scrollContent: { padding: SPACING.lg, paddingBottom: 100 },
        section: { marginBottom: SPACING.xl },
        sectionTitle: { fontSize: FONT_SIZES.lg, fontWeight: '700', color: colors.text, marginBottom: SPACING.md },
        inputGroup: { marginBottom: SPACING.md },
        label: { fontSize: FONT_SIZES.sm, fontWeight: '600', color: colors.text, marginBottom: SPACING.xs },
        input: {
            backgroundColor: colors.backgroundSecondary, borderRadius: BORDER_RADIUS.lg,
            paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
            fontSize: FONT_SIZES.md, color: colors.text,
            borderWidth: 1, borderColor: colors.border,
        },
        textArea: { minHeight: 100, textAlignVertical: 'top' },
        row: { flexDirection: 'row', gap: SPACING.md },
        halfInput: { flex: 1 },
        imagesContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
        imageWrapper: { position: 'relative', width: 100, height: 100, borderRadius: BORDER_RADIUS.lg, overflow: 'hidden' },
        image: { width: '100%', height: '100%' },
        removeImageButton: {
            position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12,
            backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center',
        },
        addImageButton: {
            width: 100, height: 100, borderRadius: BORDER_RADIUS.lg, borderWidth: 2,
            borderColor: colors.border, borderStyle: 'dashed',
            justifyContent: 'center', alignItems: 'center', backgroundColor: colors.backgroundSecondary,
        },
        amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
        amenityChip: {
            paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: BORDER_RADIUS.full,
            borderWidth: 1, borderColor: colors.border, backgroundColor: colors.backgroundSecondary,
        },
        amenityChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
        amenityText: { fontSize: FONT_SIZES.sm, color: colors.text },
        amenityTextSelected: { color: '#FFFFFF' },
        toggleRow: {
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            backgroundColor: colors.backgroundSecondary, padding: SPACING.md, borderRadius: BORDER_RADIUS.lg,
        },
        toggleLabel: { fontSize: FONT_SIZES.md, fontWeight: '600', color: colors.text },
        deleteButton: {
            marginTop: SPACING.xl, backgroundColor: '#FEE2E2', padding: SPACING.md,
            borderRadius: BORDER_RADIUS.lg, alignItems: 'center',
        },
        deleteButtonText: { color: '#EF4444', fontWeight: '700', fontSize: FONT_SIZES.md },
        loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    });

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <View style={styles.header}>
                    <TouchableOpacity style={styles.backButton} onPress={() => navigation?.goBack()}>
                        <Ionicons name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{listingId ? 'Edit Listing' : 'New Listing'}</Text>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={isSaving}>
                        {isSaving ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.saveButtonText}>Save</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Basic Info */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Title *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.title}
                            onChangeText={text => setFormData(prev => ({ ...prev, title: text }))}
                            placeholder="e.g., Modern 2BR Near Campus"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Description</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            value={formData.description}
                            onChangeText={text => setFormData(prev => ({ ...prev, description: text }))}
                            placeholder="Describe your listing..."
                            placeholderTextColor={colors.textMuted}
                            multiline
                        />
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Monthly Rent ($) *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.rent}
                            onChangeText={text => setFormData(prev => ({ ...prev, rent: text }))}
                            placeholder="1200"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Location */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Location</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Address *</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.address}
                            onChangeText={text => setFormData(prev => ({ ...prev, address: text }))}
                            placeholder="123 Main Street"
                            placeholderTextColor={colors.textMuted}
                        />
                    </View>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>City</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.city}
                                onChangeText={text => setFormData(prev => ({ ...prev, city: text }))}
                                placeholder="City"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>State</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.state}
                                onChangeText={text => setFormData(prev => ({ ...prev, state: text }))}
                                placeholder="State"
                                placeholderTextColor={colors.textMuted}
                            />
                        </View>
                    </View>
                </View>

                {/* Details */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Details</Text>
                    <View style={styles.row}>
                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>Bedrooms</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.bedrooms}
                                onChangeText={text => setFormData(prev => ({ ...prev, bedrooms: text }))}
                                placeholder="2"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={[styles.inputGroup, styles.halfInput]}>
                            <Text style={styles.label}>Bathrooms</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.bathrooms}
                                onChangeText={text => setFormData(prev => ({ ...prev, bathrooms: text }))}
                                placeholder="1"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Square Feet</Text>
                        <TextInput
                            style={styles.input}
                            value={formData.squareFeet}
                            onChangeText={text => setFormData(prev => ({ ...prev, squareFeet: text }))}
                            placeholder="800"
                            placeholderTextColor={colors.textMuted}
                            keyboardType="numeric"
                        />
                    </View>
                </View>

                {/* Photos */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Photos</Text>
                    <View style={styles.imagesContainer}>
                        {formData.images.map((uri, index) => (
                            <View key={index} style={styles.imageWrapper}>
                                <Image source={{ uri }} style={styles.image} />
                                <TouchableOpacity
                                    style={styles.removeImageButton}
                                    onPress={() => handleRemoveImage(index)}
                                >
                                    <Ionicons name="close" size={14} color="#FFFFFF" />
                                </TouchableOpacity>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addImageButton} onPress={handlePickImage}>
                            <Ionicons name="add" size={32} color={colors.textMuted} />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Amenities */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Amenities</Text>
                    <View style={styles.amenitiesGrid}>
                        {AMENITIES.map(amenity => (
                            <TouchableOpacity
                                key={amenity}
                                style={[
                                    styles.amenityChip,
                                    formData.amenities.includes(amenity) && styles.amenityChipSelected,
                                ]}
                                onPress={() => toggleAmenity(amenity)}
                            >
                                <Text style={[
                                    styles.amenityText,
                                    formData.amenities.includes(amenity) && styles.amenityTextSelected,
                                ]}>
                                    {amenity}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                {/* Status Toggle */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Status</Text>
                    <View style={styles.toggleRow}>
                        <Text style={styles.toggleLabel}>Listing Active</Text>
                        <Switch
                            value={formData.isActive}
                            onValueChange={value => setFormData(prev => ({ ...prev, isActive: value }))}
                            trackColor={{ false: colors.border, true: colors.primary }}
                            thumbColor="#FFFFFF"
                        />
                    </View>
                </View>

                {/* Delete Button */}
                {listingId && (
                    <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                        <Text style={styles.deleteButtonText}>Delete Listing</Text>
                    </TouchableOpacity>
                )}
            </ScrollView>
        </View>
    );
};

export default EditListingScreen;
