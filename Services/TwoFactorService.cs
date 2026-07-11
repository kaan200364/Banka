using OtpNet;
using QRCoder;

namespace CSF.API.Services
{
    public class TwoFactorService
    {
        public (string secretKey, string qrCodeBase64) GenerateSecret(string username)
        {
            var key = KeyGeneration.GenerateRandomKey(20);
            var base32Secret = Base32Encoding.ToString(key);

            var issuer = "CSFYonetimSistemi";
            var otpUri = $"otpauth://totp/{issuer}:{username}?secret={base32Secret}&issuer={issuer}";

            using var qrGenerator = new QRCodeGenerator();
            var qrCodeData = qrGenerator.CreateQrCode(otpUri, QRCodeGenerator.ECCLevel.Q);
            var qrCode = new PngByteQRCode(qrCodeData);
            var qrCodeBytes = qrCode.GetGraphic(20);

            return (base32Secret, Convert.ToBase64String(qrCodeBytes));
        }

        public bool VerifyCode(string secretKey, string code)
        {
            var key = Base32Encoding.ToBytes(secretKey);
            var totp = new Totp(key);
            return totp.VerifyTotp(code, out _, new VerificationWindow(2, 2));
        }
    }
}