import type { SVGProps } from 'react';
import Image from 'next/image';

interface VitaCoinLogoProps extends Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> {
    width?: number | `${number}`;
    height?: number | `${number}`;
}

export function VitaCoinLogo({ width = 384, height = 384, ...props }: VitaCoinLogoProps) {
    return (
        <Image
            src="/VitaCoin.png"
            alt="VitaCoin Logo"
            width={width}
            height={height}
            className={`w-full h-auto max-w-[384px] ${props.className || ''}`}
            style={{ objectFit: 'contain', ...props.style }}
            priority={true}
            quality={95}
        />
    );
}
