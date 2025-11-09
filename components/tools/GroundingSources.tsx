import React from 'react';
import { GroundingChunk } from "@google/genai";

interface GroundingSourcesProps {
    chunks: GroundingChunk[] | undefined;
}

const GroundingSources: React.FC<GroundingSourcesProps> = ({ chunks }) => {
    if (!chunks || chunks.length === 0) {
        return null;
    }

    // Filter out chunks that don't have a valid web or maps source with a URI
    const validChunks = chunks.filter(chunk => {
        const source = chunk.web || chunk.maps;
        return source && source.uri;
    });

    if (validChunks.length === 0) {
        return null;
    }

    return (
        <div className="mb-4">
            <h5 className="font-semibold text-dark mb-2">Fontes e Referências</h5>
            <ul className="list-disc list-inside space-y-1 text-sm">
                {validChunks.map((chunk, index) => {
                    const source = chunk.web || chunk.maps!;
                    return (
                        <li key={index}>
                            <a 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="text-primary hover:underline break-all"
                                title={source.uri}
                            >
                                {source.title || new URL(source.uri).hostname}
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default GroundingSources;