import { Card } from '@heroui/card';

/**
 * GlassCard - A reusable premium blur/glass card component
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.className - Additional classes to apply
 * @param {boolean} props.isHoverable - Enable hover shadow effect
 * @param {boolean} props.isPressable - Enable press interaction
 * @param {function} props.onPress - Press handler (when isPressable)
 * @param {'sm' | 'md' | 'lg'} props.padding - Padding size preset
 */
const GlassCard = ({
    children,
    className = '',
    style = {},
    isHoverable = true,
    isPressable = false,
    onPress,
    padding = 'md',
    allowOverflow = false
}) => {
    const paddingClasses = {
        sm: 'p-4',
        md: 'p-6',
        lg: 'p-8',
        none: ''
    };

    return (
        <Card
            isBlurred
            isPressable={isPressable}
            onPress={onPress}
            style={allowOverflow ? { overflow: 'visible', ...style } : style}
            className={`
                border border-white/20 
                bg-white/10 
                dark:bg-default-100/30 
                backdrop-blur-3xl 
                shadow-lg 
                rounded-[2rem]
                ${isHoverable ? 'hover:shadow-xl transition-shadow' : ''}
                ${paddingClasses[padding] || paddingClasses.md}
                ${className}
            `.trim().replace(/\s+/g, ' ')}
        >
            {children}
        </Card>
    );
};

export default GlassCard;
