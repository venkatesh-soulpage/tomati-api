
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
    },
    email: {
        type: String,
        unique: true,
    },
    description: {
        type: String,
    },
    isVerified: { 
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        enum: ['USER', 'MOD', 'ADMIN', 'GOD'],
        default: 'USER',
    },
    password: {
        type: String,
        // After oAuth it might not be required to have a password
        // required: true,
    },
    passwordResetToken: {
        type: String
    },
    passwordResetExpires: {
        type: Date
    },
    // OAuth
    signupMethod: {
        type: String,
        enum: ['EMAIL', 'GITHUB'],
        default: 'EMAIL',
    },
    githubToken: {
        type: String,
    }
}, {timestamps:true})

// If the password field is modified hash the password before saving it.
userSchema.pre('save', function(next){

    let user = this;

    if (!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt){
        if (err){ return next(err) }

        bcrypt.hash(user.password, salt, function(err, hash){
            if(err){return next(err)}
            user.password = hash;
            next();
        })
   })
});

//  Method to compare that the password is the same as the hash.
userSchema.methods.comparePassword = (candidatePassword,next) => { 
    bcrypt.compare(candidatePassword, this.password, (err,isMatch) => {
        if(err) return next(err);
        next(null, isMatch)
    })
}

// Find for login
userSchema.statics.findByLogin = async function (login) {
    let user = await this.findOne({
        username: login,
    })

    if (!user) {
        user = await this.findOne({email: login});
    }

    return user;
}

const User = mongoose.model('User', userSchema);

export default User;