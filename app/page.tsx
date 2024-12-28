"use client";
import * as faceapi from "face-api.js";
import { useEffect, useRef } from "react";

export default function Home() {
	const videoRef = useRef<HTMLVideoElement>(null);
	const canvasRef = useRef<HTMLVideoElement>(null);
	useEffect(() => {
		navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
			const video = videoRef.current;
			if (video) {
				video.srcObject = stream;
				video.play();
			}
		});
	}, []);

	const MODEL_URL = "/models";

	const loadModels = async () => {
		await faceapi.loadSsdMobilenetv1Model(MODEL_URL);
		await faceapi.loadFaceLandmarkModel(MODEL_URL);
		await faceapi.loadFaceRecognitionModel(MODEL_URL);
		await faceapi.loadTinyFaceDetectorModel(MODEL_URL);

		const videoEl = videoRef.current as HTMLVideoElement;
		const canvasEl = canvasRef.current as unknown as HTMLCanvasElement;

		const detection = await faceapi.detectSingleFace(
			videoEl as HTMLVideoElement,
			new faceapi.TinyFaceDetectorOptions(),
		);

		if (!detection) return;

		const dimensions = {
			width: videoEl?.offsetWidth,
			height: videoEl?.offsetHeight,
		};

		const detectionSize = faceapi.resizeResults(detection, dimensions);
		faceapi.matchDimensions(canvasEl, dimensions);
		faceapi.draw.drawDetections(canvasEl, detectionSize);
	};

	async function loadMetaData() {
		await loadModels();
		setInterval(() => loadMetaData(), 1000);
	}

	return (
		<main>
			<h1 className="text-3xl font-bold underline">Hello world!</h1>
			<div className="bg-white relative">
				<video className="w-full h-full" autoPlay ref={videoRef}></video>
				<canvas
					onLoadedMetadata={loadMetaData}
					ref={canvasRef}
					className="absolute inset-0 w-full h-full"
				></canvas>
			</div>
		</main>
	);
}
