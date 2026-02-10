import { createContext, useContext, useState, useEffect } from 'react';
import { type UserData, saveUserData } from '../lib/userData';

interface TrackedDegreesContextType {
    trackedIds: string[];
    userData: UserData | null;
    updateUserData: (data: Partial<UserData>) => void; // Added updater
    toggleTrack: (id: string) => void;
    removeTrack: (id: string) => void;
    isTracked: (id: string) => boolean;
    initialize: (ids: string[]) => void;
}

const TrackedDegreesContext = createContext<TrackedDegreesContextType | undefined>(undefined);

export const useTrackedDegrees = () => {
    const context = useContext(TrackedDegreesContext);
    if (!context) {
        throw new Error('useTrackedDegrees must be used within a TrackedDegreesProvider');
    }
    return context;
};

interface TrackedDegreesProviderProps {
    children: React.ReactNode;
    initialIds?: string[];
    userData?: UserData | null;
    onUpdateUserData?: (data: Partial<UserData>) => void; // Prop from App
}

export const TrackedDegreesProvider = ({ children, initialIds = [], userData, onUpdateUserData }: TrackedDegreesProviderProps) => {
    const [trackedIds, setTrackedIds] = useState<string[]>(initialIds);

    // Sync with initialIds when they load (e.g. from App.tsx async load)
    useEffect(() => {
        if (initialIds.length > 0) {
            setTrackedIds(prev => {
                // Merge or overwrite? 
                // For now, let's trust the loaded data if we haven't modified local state yet
                // Or just simplistic set
                return initialIds;
            });
        }
    }, [initialIds]);

    const saveChanges = (newIds: string[]) => {
        if (!userData) return;

        // Create updated user data object
        const updatedData: UserData = {
            ...userData,
            trackedPrograms: newIds
        };

        // Persist
        saveUserData(updatedData);
    };

    const toggleTrack = (id: string) => {
        setTrackedIds(prev => {
            const exists = prev.includes(id);
            const newIds = exists ? prev.filter(p => p !== id) : [...prev, id];
            saveChanges(newIds);
            return newIds;
        });
    };

    const removeTrack = (id: string) => {
        setTrackedIds(prev => {
            const newIds = prev.filter(p => p !== id);
            saveChanges(newIds);
            return newIds;
        });
    };

    const isTracked = (id: string) => trackedIds.includes(id);

    const initialize = (ids: string[]) => {
        setTrackedIds(ids);
    };

    const updateUserData = (data: Partial<UserData>) => {
        if (onUpdateUserData) {
            onUpdateUserData(data);
        } else {
            console.warn('TrackedDegreesProvider: No onUpdateUserData provided');
        }
    };

    return (
        <TrackedDegreesContext.Provider value={{ trackedIds, userData: userData || null, updateUserData, toggleTrack, removeTrack, isTracked, initialize }}>
            {children}
        </TrackedDegreesContext.Provider>
    );
};
