// This file exports interfaces and types that are used throughout the application.
// It may define custom types to enhance type safety in the project.
export interface Point {
    //id: string;
    taken: boolean;
    x: number;
    y: number;
    outgoingPaths?: Path[];
    availablePoints?: Point[];
}

export interface Path {
    direction: 'up' | 'down' | 'left' | 'right' | 'up-left' | 'up-right' | 'down-left' | 'down-right';
    color?: string;
}