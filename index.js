import { loadModel, transcribe, unloadModel, close, WHISPER_TINY } from '@qvac/sdk';

async function main() {
    console.log('========================================');
    console.log('Gujarati Voice Transcriber (QVAC SDK)');
    console.log('========================================\n');

    console.log('Loading Whisper Tiny model on-device...');
    console.log('(Intel MacBook: CPU only — may take 5-10 minutes)\n');

    try {
        const modelId = await loadModel({
            modelSrc: WHISPER_TINY,
            modelType: 'whisper',
            modelConfig: {
                language: 'gu',        // Gujarati
                strategy: 'greedy',    // deterministic output
                n_threads: 4,
                no_timestamps: true,
                suppress_blank: true,
                suppress_nst: true,
                temperature: 0.0
            },
            onProgress: (p) => {
                const mb = (n) => (n / 1e6).toFixed(1);
                const line = `Downloading ${p.percentage.toFixed(0)}% (${mb(p.downloaded)}/${mb(p.total)} MB)`;
                process.stderr.write(process.stderr.isTTY ? `\r${line}` : `${line}\n`);
                if (p.percentage >= 100) process.stderr.write('\n');
            }
        });

        console.log(`\nModel loaded. ID: ${modelId}\n`);

        console.log('Transcribing sample.wav...\n');
        const text = await transcribe({
            modelId,
            audioChunk: './sample.wav'
        });

        console.log('=== Transcription Result ===');
        console.log(text);
        console.log('============================\n');

        await unloadModel({ modelId });
        console.log('Model unloaded. Done.');

        await close();
        process.exit(0);

    } catch (error) {
        console.error('\nERROR:', error.message || error);
        await close().catch(() => {});
        process.exit(1);
    }
}

main();
