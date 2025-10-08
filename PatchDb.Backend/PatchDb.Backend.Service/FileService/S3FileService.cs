using Amazon;
using Amazon.Runtime;
using Amazon.S3;
using Amazon.S3.Model;
using PatchDb.Backend.Service.FileService.Configuration;

namespace PatchDb.Backend.Service.FileService;

public interface IS3FileService
{
    string GetUploadUrl(string path);
    string GetDownloadUrl(string path);
    Task<bool> FileExists(string path);
    Task DownloadFile(string path, Stream stream);
    Task UploadFile(string path, Stream stream);
    Task DeleteFile(string path);
}

public class S3FileService : IS3FileService
{
    private readonly AmazonS3Client _s3Client;
    private readonly AwsConfiguration _config;

    public S3FileService(AwsConfiguration config, AwsCredentials credentials)
    {
        _config = config;
        Console.WriteLine($"AccessKey: {credentials.AccessKey}, SecretAccessKey: {credentials.SecretAccessKey}, Region: {config.Region}, BucketName: {config.BucketName}");
        _s3Client = new AmazonS3Client(new BasicAWSCredentials(credentials.AccessKey, credentials.SecretAccessKey), RegionEndpoint.GetBySystemName(_config.Region));
    }

    public string GetUploadUrl(string path) => _s3Client.GetPreSignedURL(
        new GetPreSignedUrlRequest
        {
            BucketName = _config.BucketName,
            Expires = DateTime.UtcNow.AddHours(4),
            Verb = HttpVerb.PUT,
            Key = path
        });

    public string GetDownloadUrl(string path) => _s3Client.GetPreSignedURL(
        new GetPreSignedUrlRequest
        {
            BucketName = _config.BucketName,
            Expires = DateTime.UtcNow.AddHours(4),
            Verb = HttpVerb.GET,
            Key = path
        });

    public async Task<bool> FileExists(string filename)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _config.BucketName,
                Key = filename
            };

            var response = await _s3Client.GetObjectMetadataAsync(request);
            return true;
        }
        catch (AmazonS3Exception ex)
        {
            if (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
                return false;

            throw;
        }
    }

    public Task UploadFile(string path, Stream stream)
    {
        throw new NotImplementedException();
    }

    public async Task DownloadFile(string path, Stream stream)
    {
        var request = new GetObjectRequest
        {
            BucketName = _config.BucketName,
            Key = path
        };

        using var response = await _s3Client.GetObjectAsync(request);

        if (response.HttpStatusCode != System.Net.HttpStatusCode.OK)
        {
            throw new Exception($"Error downloading file from S3. Status code: {response.HttpStatusCode}");
        }

        await response.ResponseStream.CopyToAsync(stream);
        stream.Position = 0;
    }
    
    public Task DeleteFile(string path)
    {
        throw new NotImplementedException();
    }
}