'use client';

import { useCallback, useState } from "react";
import { Dialog } from "@headlessui/react";
import { FiX, FiUpload } from "react-icons/fi";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Image from "next/image";

interface PaymentModalProps {
    isOpen?: boolean;
    onClose: () => void;
    totalPrice: number;
    listingId: string;
    reservationData: any;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
    isOpen,
    onClose,
    totalPrice, 
    listingId,
    reservationData
}) => {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
    const [referenceNumber, setReferenceNumber] = useState('');
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [screenshotBase64, setScreenshotBase64] = useState<string | null>(null);

    const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            toast.error('File size exceeds 10MB limit');
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Only image files are allowed');
            return;
        }

        setScreenshot(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setScreenshotPreview(base64);
            setScreenshotBase64(base64);
        };
        reader.readAsDataURL(file);
    };

    const handlePaymentConfirmation = async () => {
        if (!referenceNumber || !screenshot || !screenshotBase64) {
            toast.error('Please provide reference number and payment screenshot');
            return;
        }

        try {
            setIsLoading(true);

            const reservationResponse = await fetch('/api/reservations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...reservationData,
                    listingId,
                    totalPrice,
                }),
            });

            if (!reservationResponse.ok) {
                const errorText = await reservationResponse.text();
                let errorMessage = 'Failed to create reservation';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', errorText);
                }
                throw new Error(errorMessage);
            }

            let reservation;
            try {
                const responseText = await reservationResponse.text();
                reservation = JSON.parse(responseText);
            } catch (e) {
                console.error('Error parsing reservation response:', e);
                throw new Error('Invalid response from server');
            }

            if (!reservation || !reservation.id) {
                throw new Error('Invalid reservation data received');
            }

            const confirmationResponse = await fetch('/api/payment/confirm', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    listingId,
                    reservationId: reservation.id,
                    paymentMethod: selectedMethod,
                    referenceNumber,
                    screenshotUrl: screenshotBase64,
                }),
            });

            if (!confirmationResponse.ok) {
                const errorText = await confirmationResponse.text();
                let errorMessage = 'Failed to confirm payment';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    console.error('Error parsing error response:', errorText);
                }
                throw new Error(errorMessage);
            }

            toast.success('Payment confirmation submitted! We will verify your payment shortly.');
            router.push('/trips');
            onClose();
        } catch (error) {
            console.error('Payment confirmation error:', error);
            toast.error(error instanceof Error ? error.message : 'Something went wrong.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderPaymentMethod = () => {
        if (selectedMethod === 'gcash') {
            return (
                <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">GCash Payment Details</h4>
                        <p className="text-sm text-gray-600 mb-2">Send payment to:</p>
                        <div className="bg-white p-3 rounded border">
                            <p className="font-mono text-lg">0927 763 7156</p>
                            <p className="text-sm text-gray-500">J****h R.</p>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">Or scan QR code:</h4>
                        <div className="bg-white p-4 rounded border flex justify-center">
                            <Image
                                src="/images/myQR.png"
                                alt="GCash QR Code"
                                width={192}
                                height={192}
                                className="object-contain"
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <p className="text-sm text-yellow-800">
                            Please send exactly ₱{totalPrice} and keep your receipt for verification.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Reference Number
                            </label>
                            <input
                                type="text"
                                value={referenceNumber}
                                onChange={(e) => setReferenceNumber(e.target.value)}
                                placeholder="Enter GCash reference number"
                                className="w-full p-2 border rounded-md"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Payment Screenshot
                            </label>
                            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    {screenshotPreview ? (
                                        <div className="relative w-full h-48">
                                            <Image
                                                src={screenshotPreview}
                                                alt="Payment screenshot"
                                                fill
                                                className="object-contain"
                                            />
                                            <button
                                                onClick={() => {
                                                    setScreenshot(null);
                                                    setScreenshotPreview(null);
                                                    setScreenshotBase64(null);
                                                }}
                                                className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full"
                                            >
                                                <FiX size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="screenshot-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500"
                                                >
                                                    <span>Upload a file</span>
                                                    <input
                                                        id="screenshot-upload"
                                                        name="screenshot"
                                                        type="file"
                                                        accept="image/*"
                                                        className="sr-only"
                                                        onChange={handleScreenshotChange}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                PNG, JPG, GIF up to 10MB
                                            </p>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePaymentConfirmation}
                            disabled={isLoading || !referenceNumber || !screenshotBase64}
                            className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {isLoading ? 'Submitting...' : 'Submit Payment Confirmation'}
                        </button>
                    </div>

                    <button
                        onClick={() => setSelectedMethod(null)}
                        className="text-sm text-emerald-600 hover:underline mt-4"
                    >
                        ← Back to methods
                    </button>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <button
                    className="w-full p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => setSelectedMethod('gcash')}
                >
                    <span>GCash</span>
                    <span>→</span>
                </button>
                <button
                    className="w-full p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => setSelectedMethod('card')}
                    disabled={isLoading}
                >
                    <span>Credit/Debit Card</span>
                    <span>→</span>
                </button>
                <button
                    className="w-full p-3 border rounded-lg hover:bg-gray-50 flex items-center justify-between"
                    onClick={() => setSelectedMethod('maya')}
                    disabled={isLoading}
                >
                    <span>Maya</span>
                    <span>→</span>
                </button>
            </div>
        );
    };

    return (
        <Dialog open={isOpen} onClose={onClose} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto">
                <Dialog.Panel className="mx-auto max-w-md w-full rounded bg-white p-6 max-h-[90vh] overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 sticky top-0 bg-white z-10">
                        <Dialog.Title className="text-xl font-semibold">
                            Complete Your Payment
                        </Dialog.Title>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-gray-100 rounded-full"
                        >
                            <FiX size={24} />
                        </button>
                    </div>

                    <div className="space-y-4 bg-white">
                        <div className="border-t border-b py-4">
                            <div className="flex justify-between mb-2">
                                <span>Total Amount:</span>
                                <span className="font-semibold">₱{totalPrice}</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h3 className="font-medium">Payment Methods</h3>
                            {renderPaymentMethod()}
                        </div>

                        {isLoading && (
                            <div className="text-center text-gray-500">
                                Processing payment...
                            </div>
                        )}
                    </div>
                </Dialog.Panel>
            </div>
        </Dialog>
    );
};

export default PaymentModal;
