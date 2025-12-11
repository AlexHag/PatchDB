## TODO: Features



### TODO: Prio

1. Infrastructure
- CICD Deploy on push to master

2. User
- Email / Phone number
- Change / Reset Password

3. Send Emails...

4. Patch Details
- When visiting a patch page
    - See, you own this patch. You own X of these patches, update the number how many you own
    - See who you follow that own this Patch
    - See everyone that own this Patch
    - See who uploaded this Patch
    - Add this patch to favorite / wishlist

5. Feed
- See people you follow's new Patches
- See newly submitted Patches
- See Patch Events

----

- Authentication
    - Email
    - Password
    - Phone Number
    - Login with KTH? (Other universities...)

- Profile
    - Change username, email, phone number, password
    - Make profile public / private
    - Profile picture
    - Bio
    - Delete account

- Social
    - Search other users
    - Follow unfollow
        - Only non-private accounts can have followers? Incentive to not be private
    - View followers, View following, Remove following

- Friend feed
    - View friends recently aquired patches
        - Reactions, like, comment?
    - View firends recently sewn own patch on their ovve

- Your ovve & Patches
    - View your ovve (Like a favorite basically, categorize a patch into: sewn-on-ovve)
        - Remove from ovve
            - Specify how it was removed? Maybe too much
    - 3D / 2D view of the ovve? Too much?
    - Value of your patches
    - Value of your ovve

- Trade request
    - Send a trade offer to another user.
        - Offer in cash, or trade against one or more patches.
    - Publish post saying I wanna trade away this patch.
    - Publish post saying I am looking for this patch, I am willing to trade the following of my patches for it, or X in cash.
    - No messaging feature in this app, but option to share contact information with potential traders.
    - Monitor successful trades
        - Patch pricing estimation algorithm based on trades

- Advertise patches and events for patch makers
    - Are you hosting an event or pub where you will sell a specific patch? When and where?
        - Sign up that you will be attending this event.
        - Did you buy the patch recently at this event event?
            - If someone did buy the advertised patch on the event, KPI this as commision, charge a fee/percentage from the patch maker / event hoster.
        - Offer discount to PatchDB users on pubs/events

- PatchDB user roles
    - Regular user (students)
    - Admin
    - Patch maker / event hosters
    - Moderator, (employed) accepts/rejects new patches from patch makers, accept/rejects events announcements, prevent abuse. Payed in patches or cash?

- Add patch
    - See how many you follow that also owns this Patch
    - How much did you pay for this patch?
    - When / where did you aquired it?
    - See estimated value of this patch
    - Upload a picture of multiple patches instead of one by one
    - Upload a picture / scan of your ovve

- Global list of patches instead of individual patches
    - Search for any patch
    - See when / where it was most recently purchased
    - See who wants to buy this
    - See who wants to sell this

- Payment integrations (too much?)
    - Swish
    - Stripe
    - Crypto
    - Revolut

- Privacy policy, T&C, GDPR and other legal...

# Technical TODO:

### Done

- Kubernetes - DONE
- Container Registry - DONE
- CI/CD - DONE
- AWS S3 - DONE
- Configuration / Secrets - DONE
- HTTPS/TLS Certificates - DONE

### TODO
- Database
    - ~~SQLite~~
    - MSSQL
    - PostgreSQL
    - MySQL
    - MongoDB
- Pub/Sub
    - Kafka
    - RabbitMQ
    - Redis
- Telemetry
    - Elastic Kibana
    - Datadog
    - Grafana
- ArgoCD
- Terraform / OpenTofu
- Cloudflare