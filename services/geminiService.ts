import { GoogleGenAI, GenerateContentResponse, Chat, VideosOperation, Modality, GroundingChunk, ImageAspectRatio, VideoAspectRatio, LiveServerMessage, Blob } from "@google/genai";
import { RationParameters } from "../types.ts";

let ai: GoogleGenAI;

const getAI = () => {
    if (!ai) {
        // Fix: Initialize GoogleGenAI with a named apiKey parameter as required by the new SDK guidelines.
        ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
    }
    return ai;
};

// For video generation, a new instance is needed each time to pick up a new key.
const getVideoAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY! });


let chat: Chat | null = null;

async function getChatSession(): Promise<Chat> {
    if (!chat) {
        const ai = getAI();
        chat = ai.chats.create({
            model: 'gemini-flash-lite-latest',
            config: {
                systemInstruction: 'Você é um assistente prestativo para profissionais de veterinária e agricultura sustentável. Seu nome é VetAgro Sustentável AI. Seja conciso, prestativo e responda sempre em português do Brasil.',
            },
        });
    }
    return chat;
}

export const streamChatMessage = async (
    message: string,
    callback: (chunk: string, isError?: boolean) => void
): Promise<void> => {
    try {
        const chatSession = await getChatSession();
        const result = await chatSession.sendMessageStream({ message });
        for await (const chunk of result) {
            callback(chunk.text);
        }
    } catch (error: any) {
        console.error('Error streaming chat message:', error);
        callback('Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.', true);
    }
};

export const generateImage = async (
    prompt: string,
    aspectRatio: ImageAspectRatio,
    referenceImage?: { base64: string; mimeType: string }
): Promise<string> => {
    try {
        const ai = getAI();
        const localizedPrompt = `${prompt}. Se houver algum texto na imagem, ele deve estar em português do Brasil.`;
        
        if (referenceImage) {
            const imagePart = {
                inlineData: {
                    data: referenceImage.base64,
                    mimeType: referenceImage.mimeType,
                },
            };
            const textPart = { text: localizedPrompt };

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: { parts: [imagePart, textPart] },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });

            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes: string = part.inlineData.data;
                    return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                }
            }
            throw new Error("Nenhuma imagem gerada na resposta da API.");

        } else {
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: localizedPrompt,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                    aspectRatio: aspectRatio,
                },
            });
            const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
            return `data:image/jpeg;base64,${base64ImageBytes}`;
        }
    } catch (error) {
        console.error('Error generating image:', error);
        throw error;
    }
};

export const editImage = async (prompt: string, referenceImage: { base64: string; mimeType: string }): Promise<string> => {
    try {
        const ai = getAI();
        const imagePart = {
            inlineData: {
                data: referenceImage.base64,
                mimeType: referenceImage.mimeType,
            },
        };
        const textPart = { text: prompt };

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: { parts: [imagePart, textPart] },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                return `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
            }
        }
        throw new Error("Nenhuma imagem editada retornada pela API.");

    } catch (error) {
        console.error('Error editing image:', error);
        throw error;
    }
};


export const generateVideo = async (
    prompt: string, 
    aspectRatio: VideoAspectRatio,
    referenceImage?: { base64: string; mimeType: string }
): Promise<{ videoUrl: string, operation: VideosOperation }> => {
    try {
        const ai = getVideoAI();
        
        const payload: any = {
            model: 'veo-3.1-fast-generate-preview',
            prompt: `${prompt}. O vídeo não deve conter texto ou narração, a menos que explicitamente solicitado.`,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: aspectRatio,
            }
        };

        if (referenceImage) {
            payload.image = {
                imageBytes: referenceImage.base64,
                mimeType: referenceImage.mimeType,
            };
        }

        let operation = await ai.models.generateVideos(payload);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
            throw new Error('Video generation failed to produce a valid URI.');
        }

        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);
        
        return { videoUrl, operation };

    } catch (error) {
        console.error('Error generating video:', error);
        throw error;
    }
};


export const extendVideo = async (previousOperation: VideosOperation, prompt: string): Promise<{ videoUrl: string, operation: VideosOperation }> => {
    try {
        const ai = getVideoAI();
        const previousVideo = previousOperation.response?.generatedVideos?.[0]?.video;
        if (!previousVideo) {
            throw new Error("Previous video data not found in operation.");
        }

        let operation = await ai.models.generateVideos({
            model: 'veo-3.1-generate-preview',
            prompt: `${prompt}. O vídeo não deve conter texto ou narração, a menos que explicitamente solicitado.`,
            video: previousVideo,
            config: {
                numberOfVideos: 1,
                resolution: '720p',
                aspectRatio: previousVideo.aspectRatio as VideoAspectRatio,
            }
        });

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }

        if (!operation.response?.generatedVideos?.[0]?.video?.uri) {
            throw new Error('Video extension failed to produce a valid URI.');
        }
        
        const downloadLink = operation.response.generatedVideos[0].video.uri;
        const response = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
        const videoBlob = await response.blob();
        const videoUrl = URL.createObjectURL(videoBlob);

        return { videoUrl, operation };

    } catch (error) {
        console.error('Error extending video:', error);
        throw error;
    }
};

export const analyzeImage = async (prompt: string, imageBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAI();
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };
        const textPart = { text: `${prompt} Responda sempre em português do Brasil.` };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error('Error analyzing image:', error);
        throw error;
    }
};

export const analyzeVideo = async (prompt: string, videoBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAI();
        const videoPart = {
            inlineData: {
                data: videoBase64,
                mimeType: mimeType,
            },
        };
        const textPart = { text: `${prompt} Responda sempre em português do Brasil.` };
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [videoPart, textPart] },
        });
        return response.text;
    } catch (error) {
        console.error('Error analyzing video:', error);
        throw error;
    }
};

export const transcribeAudio = async (audioBase64: string, mimeType: string): Promise<string> => {
    try {
        const ai = getAI();
        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType: mimeType,
            },
        };
        const textPart = { text: "Transcreva este áudio. O idioma é português do Brasil." };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [audioPart, textPart] }
        });

        return response.text;
    } catch (error) {
        console.error('Error transcribing audio:', error);
        throw error;
    }
};

export const analyzeAudioScript = async (audioBase64: string, mimeType: string, prompt: string): Promise<string> => {
    try {
        const ai = getAI();
        const audioPart = {
            inlineData: {
                data: audioBase64,
                mimeType: mimeType,
            },
        };
        const textPart = { text: `${prompt} Responda sempre em português do Brasil.` };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro', 
            contents: { parts: [audioPart, textPart] }
        });

        return response.text;
    } catch (error) {
        console.error('Error analyzing audio script:', error);
        throw error;
    }
};

export const analyzeFieldNotes = async (transcribedText: string): Promise<string> => {
    try {
        const ai = getAI();
        const prompt = `
            Você é um assistente especialista em veterinária e agronomia. Sua tarefa é analisar a seguinte transcrição de áudio de uma nota de campo e estruturá-la de forma clara e organizada.
            A resposta DEVE ser em português do Brasil e formatada em Markdown.

            Extraia e organize as informações nas seguintes seções (se aplicável):
            - **Identificação do Animal/Local:** (Ex: Brinco, lote, nome, localização GPS, etc.)
            - **Espécie/Raça/Cultura:**
            - **Histórico/Anamnese:** (Informações prévias relevantes)
            - **Sinais Clínicos / Observações de Campo:** (Liste os achados do exame físico ou da avaliação da lavoura)
            - **Suspeita(s) Clínica(s) / Diagnóstico Preliminar:**
            - **Ações Realizadas / Exames Solicitados:** (Ex: Coleta de amostras, medições, etc.)
            - **Plano Terapêutico / Recomendações:** (Tratamentos, manejos sugeridos, próximos passos)

            Se alguma informação não estiver presente, omita a seção. Seja objetivo e técnico.

            ---
            **Texto Transcrito para Análise:**
            "${transcribedText}"
            ---
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error('Error analyzing field notes:', error);
        throw error;
    }
};

export const queryWithMaps = async (prompt: string, lat?: number, lon?: number): Promise<{ text: string, chunks: GroundingChunk[] | undefined }> => {
    try {
        const ai = getAI();
        const config: any = {
            tools: [{ googleMaps: {} }, { googleSearch: {} }],
        };
        if (lat && lon) {
            config.toolConfig = {
                retrievalConfig: {
                    latLng: {
                        latitude: lat,
                        longitude: lon
                    }
                }
            };
        }
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${prompt} Responda sempre em português do Brasil.`,
            config: config,
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        return { text: response.text, chunks: chunks };
    } catch (error) {
        console.error('Error querying with Maps:', error);
        throw error;
    }
};

export const analyzeContent = async (prompt: string, content: string): Promise<string> => {
    try {
        const ai = getAI();
        const fullPrompt = `${prompt}\n\n---\n\n${content}`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `${fullPrompt} Responda sempre em português do Brasil.`,
        });
        return response.text;
    } catch (error) {
        console.error('Error analyzing content:', error);
        throw error;
    }
};

export const complexScenarioQuery = async (prompt: string): Promise<{ text: string, chunks: GroundingChunk[] | undefined }> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: `${prompt} Responda sempre em português do Brasil.`,
            config: { 
                thinkingConfig: { thinkingBudget: 32768 },
                tools: [{googleSearch: {}}]
            },
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        return { text: response.text, chunks };
    } catch (error) {
        console.error('Error with complex query:', error);
        throw error;
    }
};

export const getDifferentialDiagnosis = async (species: string, age: string, symptoms: string): Promise<{ text: string, chunks: GroundingChunk[] | undefined }> => {
    try {
        const ai = getAI();
        const prompt = `
            Como uma IA de suporte veterinário, forneça uma lista de possíveis diagnósticos diferenciais para o seguinte caso.
            Para cada diagnóstico, inclua uma breve justificativa com base nos sintomas fornecidos.
            Esta informação é apenas para fins informativos e não substitui um exame veterinário profissional.
            Responda sempre em português do Brasil.

            - Espécie: ${species}
            - Idade/Estágio: ${age || 'Não especificado'}
            - Sinais Clínicos: ${symptoms}

            Formate a resposta de forma clara em Markdown.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            },
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        return { text: response.text, chunks };
    } catch (error) {
        console.error('Error getting differential diagnosis:', error);
        throw error;
    }
};

export const identifyPlant = async (imageBase64: string, mimeType: string, analyzeDiseases: boolean): Promise<{ text: string, chunks: GroundingChunk[] | undefined }> => {
    try {
        const ai = getAI();
        
        let prompt = "Identifique esta planta. Forneça seus nomes comum e científico, e indique se ela é conhecida por ser tóxica para o gado (ex: bovinos, cavalos, ovelhas). Formate a resposta de forma clara em Markdown. Responda sempre em português do Brasil.";

        if (analyzeDiseases) {
            prompt += `\n\n**Análise de Doenças:**\nAdicionalmente, com base em sinais visuais na imagem (como manchas, descoloração, murcha, lesões ou padrões anormais), forneça uma lista de possíveis diagnósticos diferenciais para doenças. Para cada suspeita, descreva brevemente os sintomas visuais que a justificam.\n\n**Aviso:** Esta é uma análise visual preliminar e não substitui um diagnóstico de campo realizado por um engenheiro agrônomo.`;
        }

        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };
        const textPart = { text: prompt };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: { parts: [imagePart, textPart] },
            config: {
                tools: [{googleSearch: {}}]
            }
        });
        
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        return { text: response.text, chunks };
    } catch (error) {
        console.error('Error identifying plant:', error);
        throw error;
    }
};

export const calculateRation = async (animalInfo: RationParameters): Promise<{ text: string, chunks: GroundingChunk[] | undefined }> => {
    try {
        const ai = getAI();
        const prompt = `
            Como uma IA especialista em nutrição animal, formule uma ração balanceada com base nas seguintes informações.
            Responda sempre em português do Brasil.

            **Informações do Animal:**
            - Espécie: ${animalInfo.species}
            - Idade/Estágio: ${animalInfo.age}
            - Peso: ${animalInfo.weight} kg
            - Objetivo: ${animalInfo.goal}
            - Ingredientes Disponíveis: ${animalInfo.ingredients}

            **Instruções de Saída:**
            1. **Formulação da Ração:** Apresente a formulação da ração em uma tabela Markdown. A tabela DEVE ter as colunas: "Ingrediente", "Quantidade (kg na matéria seca)" e "Porcentagem (%) na matéria seca".
            2. **Garantias Nutricionais:** Após a tabela de formulação, crie uma segunda tabela Markdown com as garantias nutricionais estimadas da dieta final (ex: Proteína Bruta, NDT, Energia, etc.).
            3. **Recomendações:** Forneça uma breve explicação da lógica da formulação e instruções de manejo ou mistura.

            **Importante:** A apresentação dos dados numéricos em tabelas é OBRIGATÓRIA para clareza e organização.

            Este é um cálculo teórico e deve ser validado por um profissional.
        `;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-pro",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}]
            }
        });
        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
        return { text: response.text, chunks };
    } catch (error) {
        console.error('Error calculating ration:', error);
        throw error;
    }
};


export const generateSpeech = async (text: string): Promise<string> => {
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: `Diga com um tom neutro e informativo: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error('Error generating speech:', error);
        throw error;
    }
};

export const connectLiveSession = (callbacks: {
    onopen: () => void;
    onmessage: (message: LiveServerMessage) => Promise<void>;
    onerror: (e: ErrorEvent) => void;
    onclose: (e: CloseEvent) => void;
}) => {
    const ai = getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      callbacks: callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
        },
        systemInstruction: 'Você é um assistente prestativo para profissionais de veterinária e agricultura sustentável. Seu nome é VetAgro Sustentável AI. Responda de forma concisa e direta, sempre em português do Brasil.',
      },
    });
};

export const summarizeEbooks = async (ebooks: Array<{ title: string; author: string }>): Promise<string> => {
    try {
        const ai = getAI();
        const ebookList = ebooks.map(e => `- "${e.title}" por ${e.author}`).join('\n');
        const prompt = `
            Você é um assistente de marketing digital.
            Crie um parágrafo curto e atrativo (máximo de 2-3 frases) para descrever a seguinte coleção de e-books.
            O resumo deve ser convidativo e destacar os temas principais, incentivando o usuário a explorar os materiais.
            Responda sempre em português do Brasil.

            Coleção de E-books:
            ${ebookList}
        `;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error('Error summarizing ebooks:', error);
        throw error;
    }
};
