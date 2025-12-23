import React, { useState, useCallback } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    KeyboardAvoidingView,
    Platform,
    Alert,
    Image,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../constants/theme';
import listingService from '../services/listingService';
import { config } from '../config';

const { width } = Dimensions.get('window');
const AMENITY_CARD_SIZE = (width - SPACING.lg * 2 - SPACING.md * 2) / 3;

interface CreateListingScreenProps {
    navigation?: any;
}

interface AddressSuggestion {
    place_name: string;
    text: string;
    center: [number, number];
    context: Array<{ id: string; text: string }>;
}

const CreateListingScreen: React.FC<CreateListingScreenProps> = ({ navigation }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        city: 'Corvallis',
        state: 'OR',
        zipCode: '',
        rent: '',
        bedrooms: '',
        bathrooms: '',
        sqft: '',
        leaseTerm: 'academic-year',
        availableDate: '',
        amenities: [] as string[],
        latitude: 0,
        longitude: 0,
    });
    const [images, setImages] = useState<string[]>([]);

    // Address autocomplete state
    const [addressQuery, setAddressQuery] = useState('');
    const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const amenitiesList = [
        { id: 'WiFi', icon: 'wifi', label: 'WiFi' },
        { id: 'parking', icon: 'car', label: 'Parking' },
        { id: 'laundry', icon: 'water', label: 'Laundry' },
        { id: 'pet-friendly', icon: 'paw', label: 'Pets OK' },
        { id: 'furnished', icon: 'bed', label: 'Furnished' },
        { id: 'AC', icon: 'snow', label: 'A/C' },
        { id: 'dishwasher', icon: 'restaurant', label: 'Dishwasher' },
        { id: 'gym', icon: 'fitness', label: 'Gym' },
        { id: 'pool', icon: 'water', label: 'Pool' },
    ];

    const leaseOptions = [
        { value: 'month-to-month', label: 'Monthly' },
        { value: '6-months', label: '6 Months' },
        { value: '1-year', label: '1 Year' },
        { value: 'academic-year', label: 'Academic' },
    ];

    const updateForm = (field: string, value: string | string[] | number) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleAmenity = (id: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(id)
                ? prev.amenities.filter(a => a !== id)
                : [...prev.amenities, id]
        }));
    };

    // Mapbox address search
    const searchAddress = useCallback(async (query: string) => {
        setAddressQuery(query);
        if (query.length < 3) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        try {
            const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?` +
                `access_token=${config.MAPBOX_ACCESS_TOKEN}&` +
                `country=us&` +
                `types=address&` +
                `limit=5`
            );
            const data = await response.json();
            setSuggestions(data.features || []);
            setShowSuggestions(true);
        } catch (error) {
            console.error('Address search error:', error);
        }
    }, []);

    const selectAddress = (suggestion: AddressSuggestion) => {
        setAddressQuery(suggestion.place_name);
        updateForm('address', suggestion.text);
        updateForm('longitude', suggestion.center[0]);
        updateForm('latitude', suggestion.center[1]);

        // Extract city, state, zip from context
        suggestion.context?.forEach(ctx => {
            if (ctx.id.startsWith('place')) {
                updateForm('city', ctx.text);
            } else if (ctx.id.startsWith('region')) {
                updateForm('state', ctx.text.substring(0, 2).toUpperCase());
            } else if (ctx.id.startsWith('postcode')) {
                updateForm('zipCode', ctx.text);
            }
        });

        setShowSuggestions(false);
    };

    // Image picker
    const pickImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera roll permissions to add photos');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true,
            quality: 0.8,
            selectionLimit: 10 - images.length,
        });

        if (!result.canceled && result.assets) {
            const newImages = result.assets.map(asset => asset.uri);
            setImages(prev => [...prev, ...newImages].slice(0, 10));
        }
    };

    const takePhoto = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission needed', 'Please grant camera permissions to take photos');
            return;
        }

        const result = await ImagePicker.launchCameraAsync({
            quality: 0.8,
        });

        if (!result.canceled && result.assets) {
            setImages(prev => [...prev, result.assets[0].uri].slice(0, 10));
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const validateStep = () => {
        if (step === 1) {
            if (!formData.title || !formData.description) {
                Alert.alert('Missing Info', 'Please fill in the title and description');
                return false;
            }
        } else if (step === 2) {
            if (!addressQuery || !formData.rent || !formData.bedrooms) {
                Alert.alert('Missing Info', 'Please fill in address, rent, and bedrooms');
                return false;
            }
        } else if (step === 3) {
            if (images.length === 0) {
                Alert.alert('Missing Photos', 'Please add at least one photo of your place');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep()) {
            if (step < 4) {
                setStep(step + 1);
            } else {
                handleSubmit();
            }
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const listingData = {
                ...formData,
                address: addressQuery,
                rent: parseInt(formData.rent),
                bedrooms: parseInt(formData.bedrooms),
                bathrooms: parseFloat(formData.bathrooms || '1'),
                sqft: formData.sqft ? parseInt(formData.sqft) : undefined,
                university: 'Oregon State University',
                images: images, // Will need backend to handle base64 or upload
            };

            await listingService.createListing(listingData);
            Alert.alert('Success', 'Listing created successfully!', [
                { text: 'OK', onPress: () => navigation?.goBack?.() }
            ]);
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create listing');
        } finally {
            setLoading(false);
        }
    };

    const renderStep1 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Basic Information</Text>
            <Text style={styles.stepSubtitle}>Tell potential renters about your place</Text>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Title *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Cozy 2BR near campus"
                    value={formData.title}
                    onChangeText={(v) => updateForm('title', v)}
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Describe your place, nearby amenities, rules, etc."
                    value={formData.description}
                    onChangeText={(v) => updateForm('description', v)}
                    multiline
                    numberOfLines={5}
                    textAlignVertical="top"
                    placeholderTextColor={COLORS.textMuted}
                />
            </View>
        </View>
    );

    const renderStep2 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Property Details</Text>
            <Text style={styles.stepSubtitle}>Help renters find your listing</Text>

            {/* Address with Autocomplete */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Address *</Text>
                <View style={styles.addressContainer}>
                    <Ionicons name="location" size={20} color={COLORS.textMuted} style={styles.addressIcon} />
                    <TextInput
                        style={styles.addressInput}
                        placeholder="Start typing an address..."
                        value={addressQuery}
                        onChangeText={searchAddress}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>

                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <View style={styles.suggestionsContainer}>
                        {suggestions.map((suggestion, index) => (
                            <TouchableOpacity
                                key={index}
                                style={styles.suggestionItem}
                                onPress={() => selectAddress(suggestion)}
                            >
                                <Ionicons name="location-outline" size={18} color={COLORS.textSecondary} />
                                <Text style={styles.suggestionText} numberOfLines={2}>
                                    {suggestion.place_name}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.label}>City</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Corvallis"
                        value={formData.city}
                        onChangeText={(v) => updateForm('city', v)}
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.md }]}>
                    <Text style={styles.label}>ZIP</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="97330"
                        value={formData.zipCode}
                        onChangeText={(v) => updateForm('zipCode', v)}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
            </View>

            <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Rent/mo *</Text>
                    <View style={styles.inputWithPrefix}>
                        <Text style={styles.prefix}>$</Text>
                        <TextInput
                            style={[styles.input, styles.prefixInput]}
                            placeholder="1200"
                            value={formData.rent}
                            onChangeText={(v) => updateForm('rent', v)}
                            keyboardType="numeric"
                            placeholderTextColor={COLORS.textMuted}
                        />
                    </View>
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.md }]}>
                    <Text style={styles.label}>Sq Ft</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="800"
                        value={formData.sqft}
                        onChangeText={(v) => updateForm('sqft', v)}
                        keyboardType="numeric"
                        placeholderTextColor={COLORS.textMuted}
                    />
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bedrooms *</Text>
                <View style={styles.optionRow}>
                    {['1', '2', '3', '4+'].map((val) => (
                        <TouchableOpacity
                            key={val}
                            style={[
                                styles.optionBtn,
                                formData.bedrooms === val && styles.optionBtnActive
                            ]}
                            onPress={() => updateForm('bedrooms', val)}
                        >
                            <Text style={[
                                styles.optionText,
                                formData.bedrooms === val && styles.optionTextActive
                            ]}>{val}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Bathrooms</Text>
                <View style={styles.optionRow}>
                    {['1', '1.5', '2', '3+'].map((val) => (
                        <TouchableOpacity
                            key={val}
                            style={[
                                styles.optionBtn,
                                formData.bathrooms === val && styles.optionBtnActive
                            ]}
                            onPress={() => updateForm('bathrooms', val)}
                        >
                            <Text style={[
                                styles.optionText,
                                formData.bathrooms === val && styles.optionTextActive
                            ]}>{val}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.label}>Lease Term</Text>
                <View style={styles.optionRow}>
                    {leaseOptions.map((opt) => (
                        <TouchableOpacity
                            key={opt.value}
                            style={[
                                styles.optionBtn,
                                formData.leaseTerm === opt.value && styles.optionBtnActive
                            ]}
                            onPress={() => updateForm('leaseTerm', opt.value)}
                        >
                            <Text style={[
                                styles.optionText,
                                formData.leaseTerm === opt.value && styles.optionTextActive
                            ]}>{opt.label}</Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>
        </View>
    );

    const renderStep3 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Photos</Text>
            <Text style={styles.stepSubtitle}>Add up to 10 photos of your place</Text>

            {/* Image Grid */}
            <View style={styles.imageGrid}>
                {images.map((uri, index) => (
                    <View key={index} style={styles.imageContainer}>
                        <Image source={{ uri }} style={styles.imagePreview} />
                        <TouchableOpacity
                            style={styles.removeImageBtn}
                            onPress={() => removeImage(index)}
                        >
                            <Ionicons name="close-circle" size={24} color={COLORS.error} />
                        </TouchableOpacity>
                        {index === 0 && (
                            <View style={styles.coverBadge}>
                                <Text style={styles.coverBadgeText}>Cover</Text>
                            </View>
                        )}
                    </View>
                ))}

                {images.length < 10 && (
                    <TouchableOpacity style={styles.addImageBtn} onPress={pickImage}>
                        <Ionicons name="add" size={32} color={COLORS.textMuted} />
                        <Text style={styles.addImageText}>Add Photo</Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Quick Actions */}
            <View style={styles.photoActions}>
                <TouchableOpacity style={styles.photoActionBtn} onPress={pickImage}>
                    <Ionicons name="images" size={20} color={COLORS.primary} />
                    <Text style={styles.photoActionText}>Choose from Library</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.photoActionBtn} onPress={takePhoto}>
                    <Ionicons name="camera" size={20} color={COLORS.primary} />
                    <Text style={styles.photoActionText}>Take Photo</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.photoTip}>
                💡 Tip: The first photo will be your listing's cover image
            </Text>
        </View>
    );

    const renderStep4 = () => (
        <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Amenities & Review</Text>
            <Text style={styles.stepSubtitle}>Select available amenities</Text>

            <View style={styles.amenitiesGrid}>
                {amenitiesList.map((amenity) => (
                    <TouchableOpacity
                        key={amenity.id}
                        style={[
                            styles.amenityCard,
                            formData.amenities.includes(amenity.id) && styles.amenityCardActive
                        ]}
                        onPress={() => toggleAmenity(amenity.id)}
                    >
                        <Ionicons
                            name={amenity.icon as any}
                            size={28}
                            color={formData.amenities.includes(amenity.id) ? COLORS.card : COLORS.text}
                        />
                        <Text style={[
                            styles.amenityLabel,
                            formData.amenities.includes(amenity.id) && styles.amenityLabelActive
                        ]}>{amenity.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryTitle}>📋 Review Your Listing</Text>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Title:</Text>
                    <Text style={styles.summaryValue} numberOfLines={1}>{formData.title || 'Not set'}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Rent:</Text>
                    <Text style={styles.summaryValue}>${formData.rent || '0'}/mo</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Rooms:</Text>
                    <Text style={styles.summaryValue}>{formData.bedrooms || '?'}bd / {formData.bathrooms || '?'}ba</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Location:</Text>
                    <Text style={styles.summaryValue}>{formData.city}, {formData.state}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Photos:</Text>
                    <Text style={styles.summaryValue}>{images.length} photo{images.length !== 1 ? 's' : ''}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <SafeAreaView edges={['top']} style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => step > 1 ? setStep(step - 1) : navigation?.goBack?.()}
                >
                    <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Create Listing</Text>
                <Text style={styles.stepIndicator}>Step {step}/4</Text>
            </SafeAreaView>

            {/* Progress Bar */}
            <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${(step / 4) * 100}%` }]} />
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView
                    style={styles.content}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    <View style={{ height: 120 }} />
                </ScrollView>
            </KeyboardAvoidingView>

            {/* Footer */}
            <SafeAreaView edges={['bottom']} style={styles.footer}>
                <TouchableOpacity
                    style={[styles.nextButton, loading && styles.nextButtonDisabled]}
                    onPress={handleNext}
                    disabled={loading}
                >
                    <Text style={styles.nextButtonText}>
                        {loading ? 'Creating...' : step < 4 ? 'Continue' : 'Create Listing'}
                    </Text>
                    {!loading && <Ionicons name="arrow-forward" size={20} color={COLORS.card} />}
                </TouchableOpacity>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        backgroundColor: COLORS.background,
    },
    backButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '700',
        color: COLORS.text,
    },
    stepIndicator: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        fontWeight: '500',
    },
    progressBar: {
        height: 4,
        backgroundColor: COLORS.border,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    content: {
        flex: 1,
        paddingHorizontal: SPACING.lg,
    },
    stepContent: {
        paddingTop: SPACING.lg,
    },
    stepTitle: {
        fontSize: FONT_SIZES.xxl,
        fontWeight: '800',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    stepSubtitle: {
        fontSize: FONT_SIZES.md,
        color: COLORS.textSecondary,
        marginBottom: SPACING.xl,
    },
    inputGroup: {
        marginBottom: SPACING.lg,
    },
    label: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SPACING.xs,
    },
    input: {
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg,
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 120,
        paddingTop: SPACING.md,
    },
    row: {
        flexDirection: 'row',
    },
    inputWithPrefix: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingLeft: SPACING.md,
    },
    prefix: {
        fontSize: FONT_SIZES.lg,
        fontWeight: '600',
        color: COLORS.textSecondary,
    },
    prefixInput: {
        flex: 1,
        borderWidth: 0,
        backgroundColor: 'transparent',
    },
    optionRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.sm,
    },
    optionBtn: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.sm,
        borderRadius: BORDER_RADIUS.full,
        backgroundColor: COLORS.backgroundSecondary,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    optionBtnActive: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
    },
    optionText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
    },
    optionTextActive: {
        color: COLORS.card,
    },

    // Address autocomplete
    addressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingLeft: SPACING.md,
    },
    addressIcon: {
        marginRight: SPACING.sm,
    },
    addressInput: {
        flex: 1,
        paddingVertical: SPACING.md,
        paddingRight: SPACING.md,
        fontSize: FONT_SIZES.md,
        color: COLORS.text,
    },
    suggestionsContainer: {
        backgroundColor: COLORS.card,
        borderRadius: BORDER_RADIUS.lg,
        marginTop: SPACING.xs,
        borderWidth: 1,
        borderColor: COLORS.border,
        ...SHADOWS.md,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    suggestionText: {
        flex: 1,
        fontSize: FONT_SIZES.sm,
        color: COLORS.text,
        marginLeft: SPACING.sm,
    },

    // Photos
    imageGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: SPACING.md,
    },
    imageContainer: {
        width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
        aspectRatio: 1,
        borderRadius: BORDER_RADIUS.lg,
        overflow: 'hidden',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
    },
    removeImageBtn: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: COLORS.card,
        borderRadius: 12,
    },
    coverBadge: {
        position: 'absolute',
        bottom: 4,
        left: 4,
        backgroundColor: COLORS.primary,
        paddingHorizontal: SPACING.sm,
        paddingVertical: 2,
        borderRadius: BORDER_RADIUS.sm,
    },
    coverBadgeText: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.card,
    },
    addImageBtn: {
        width: (width - SPACING.lg * 2 - SPACING.md * 2) / 3,
        aspectRatio: 1,
        borderRadius: BORDER_RADIUS.lg,
        borderWidth: 2,
        borderColor: COLORS.border,
        borderStyle: 'dashed',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundSecondary,
    },
    addImageText: {
        fontSize: FONT_SIZES.xs,
        color: COLORS.textMuted,
        marginTop: SPACING.xs,
    },
    photoActions: {
        flexDirection: 'row',
        gap: SPACING.md,
        marginTop: SPACING.xl,
    },
    photoActionBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: SPACING.sm,
        paddingVertical: SPACING.md,
        backgroundColor: 'rgba(219, 74, 43, 0.1)',
        borderRadius: BORDER_RADIUS.lg,
    },
    photoActionText: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.primary,
    },
    photoTip: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
        marginTop: SPACING.lg,
        textAlign: 'center',
    },

    // Amenities
    amenitiesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    amenityCard: {
        width: AMENITY_CARD_SIZE,
        height: AMENITY_CARD_SIZE,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.xl,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.md,
    },
    amenityCardActive: {
        backgroundColor: COLORS.text,
        borderColor: COLORS.text,
    },
    amenityLabel: {
        fontSize: FONT_SIZES.xs,
        fontWeight: '600',
        color: COLORS.text,
        marginTop: SPACING.sm,
        textAlign: 'center',
    },
    amenityLabelActive: {
        color: COLORS.card,
    },

    // Summary
    summaryCard: {
        marginTop: SPACING.xl,
        backgroundColor: COLORS.backgroundSecondary,
        borderRadius: BORDER_RADIUS.xl,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    summaryTitle: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.text,
        marginBottom: SPACING.md,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: SPACING.sm,
    },
    summaryLabel: {
        fontSize: FONT_SIZES.sm,
        color: COLORS.textSecondary,
    },
    summaryValue: {
        fontSize: FONT_SIZES.sm,
        fontWeight: '600',
        color: COLORS.text,
        flex: 1,
        textAlign: 'right',
    },

    // Footer
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: COLORS.background,
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        padding: SPACING.lg,
    },
    nextButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: SPACING.sm,
        backgroundColor: COLORS.primary,
        paddingVertical: SPACING.md,
        borderRadius: BORDER_RADIUS.lg,
    },
    nextButtonDisabled: {
        opacity: 0.5,
    },
    nextButtonText: {
        fontSize: FONT_SIZES.md,
        fontWeight: '700',
        color: COLORS.card,
    },
});

export default CreateListingScreen;
